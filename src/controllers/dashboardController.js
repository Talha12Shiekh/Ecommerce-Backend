const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

const getDashboardStats = async (req, res) => {
    try {
        // Total Users
        const totalUsers = await User.countDocuments({ role: 'user' });

        // Total Orders
        const totalOrders = await Order.countDocuments();

        // Total Revenue (Only paid orders)
        const totalRevenueResult = await Order.aggregate([
            { $match: { isPaid: true } },
            { $group: { _id: null, total: { $sum: '$total' } } },
        ]);
        const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0;

        // Monthly Stats (Last 6 months for example, or all time)
        // Aggregating by month
        const monthlyStats = await Order.aggregate([
            {
                $match: { isPaid: true }, // or all orders depending on req, let's say paid for valid stats
            },
            {
                $group: {
                    _id: {
                        month: { $month: '$createdAt' },
                        year: { $year: '$createdAt' },
                    },
                    count: { $sum: 1 },
                    amount: { $sum: '$total' },
                },
            },
            { $sort: { '_id.year': -1, '_id.month': -1 } },
            { $limit: 6 },
        ]);

        const formattedStats = monthlyStats.map((item) => {
            const date = new Date(item._id.year, item._id.month - 1);
            const monthName = date.toLocaleString('default', { month: 'long' });
            return {
                date: `${monthName} ${item._id.year}`,
                count: item.count,
                amount: item.amount,
            };
        });

        // Revenue by Category
        const revenueByCategory = await Order.aggregate([
            { $match: { isPaid: true } },
            { $unwind: '$orderItems' },
            {
                $lookup: {
                    from: 'products',
                    localField: 'orderItems.product',
                    foreignField: '_id',
                    as: 'product',
                },
            },
            { $unwind: '$product' },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'product.category',
                    foreignField: '_id',
                    as: 'category',
                },
            },
            { $unwind: '$category' },
            {
                $group: {
                    _id: '$category.name',
                    revenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.amount'] } },
                },
            },
            { $sort: { revenue: -1 } },
        ]);

        const formattedRevenueByCategory = revenueByCategory.map((item) => ({
            category: item._id,
            revenue: item.revenue,
        }));

        // Top Selling Products
        const topSellingProducts = await Order.aggregate([
            { $match: { isPaid: true } },
            { $unwind: '$orderItems' },
            {
                $group: {
                    _id: '$orderItems.product',
                    name: { $first: '$orderItems.name' },
                    image: { $first: '$orderItems.image' },
                    price: { $first: '$orderItems.price' },
                    totalQuantitySold: { $sum: '$orderItems.amount' },
                    totalRevenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.amount'] } },
                },
            },
            { $sort: { totalQuantitySold: -1 } },
            { $limit: 5 },
        ]);

        const formattedTopSellingProducts = topSellingProducts.map((item) => ({
            productId: item._id,
            name: item.name,
            image: item.image,
            price: item.price,
            totalQuantitySold: item.totalQuantitySold,
            totalRevenue: item.totalRevenue,
        }));

        // Orders by Status
        const ordersByStatus = await Order.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                },
            },
        ]);

        const formattedOrdersByStatus = ordersByStatus.map((item) => ({
            status: item._id,
            count: item.count,
        }));

        // Average Order Value (AOV)
        const aovResult = await Order.aggregate([
            { $match: { isPaid: true } },
            {
                $group: {
                    _id: null,
                    averageValue: { $avg: '$total' },
                },
            },
        ]);
        const averageOrderValue = aovResult.length > 0 ? parseFloat(aovResult[0].averageValue.toFixed(2)) : 0;

        // New Users per Month (Last 6 months)
        const newUsersPerMonth = await User.aggregate([
            {
                $match: { role: 'user' },
            },
            {
                $group: {
                    _id: {
                        month: { $month: '$createdAt' },
                        year: { $year: '$createdAt' },
                    },
                    count: { $sum: 1 },
                },
            },
            { $sort: { '_id.year': -1, '_id.month': -1 } },
            { $limit: 6 },
        ]);

        const formattedNewUsersPerMonth = newUsersPerMonth.map((item) => {
            const date = new Date(item._id.year, item._id.month - 1);
            const monthName = date.toLocaleString('default', { month: "long" });
            return {
                date: `${monthName} ${item._id.year}`,
                count: item.count,
            };
        });

        // Active vs Inactive Users
        // Active = user has placed at least 1 order
        const activeUsersAggregation = await Order.aggregate([
            { $group: { _id: '$user' } }, // Get unique users who have placed orders
            { $count: 'activeUsersCount' },
        ]);
        const activeUsersCount = activeUsersAggregation.length > 0 ? activeUsersAggregation[0].activeUsersCount : 0;

        // Ensure we only count regular users, not admins
        const totalRegularUsers = await User.countDocuments({ role: 'user' });

        // However, an admin could potentially place an order, so let's guarantee
        // inactive users doesn't go negative just in case.
        const inactiveUsersCount = Math.max(0, totalRegularUsers - activeUsersCount);

        // Repeat Customers
        // A repeat customer is a user who has placed > 1 *paid* order
        const repeatCustomersAggregation = await Order.aggregate([
            { $match: { isPaid: true } },
            { $group: { _id: '$user', orderCount: { $sum: 1 } } },
            { $match: { orderCount: { $gt: 1 } } },
            { $count: 'repeatCustomersCount' },
        ]);

        const repeatCustomersCount = repeatCustomersAggregation.length > 0 ? repeatCustomersAggregation[0].repeatCustomersCount : 0;
        const repeatCustomerPercentage = activeUsersCount > 0 ? ((repeatCustomersCount / activeUsersCount) * 100).toFixed(1) : 0;

        // Low Stock Products
        // Find products where inventory is less than or equal to an arbitrary threshold, e.g., 10
        const lowStockProducts = await Product.find({ inventory: { $lte: 10 } })
            .select('name image inventory price')
            .sort({ inventory: 1 })
            .limit(10); // Optionally limit to top 10 lowest in stock

        // Most Reviewed Products
        const mostReviewedProducts = await Product.find({})
            .select('name image numOfReviews averageRating price')
            .sort({ numOfReviews: -1 })
            .limit(5);

        // Daily Sales (Last 7 Days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const dailySales = await Order.aggregate([
            {
                $match: {
                    isPaid: true,
                    createdAt: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: {
                        day: { $dayOfMonth: '$createdAt' },
                        month: { $month: '$createdAt' },
                        year: { $year: '$createdAt' }
                    },
                    sales: { $sum: '$total' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
        ]);

        const formattedDailySales = dailySales.map(item => {
            const date = new Date(item._id.year, item._id.month - 1, item._id.day);
            return {
                date: date.toISOString().split('T')[0], // Forma: YYYY-MM-DD
                sales: parseFloat(item.sales.toFixed(2)),
                count: item.count
            };
        });

        // Total Yearly Revenue (Current Year)
        const currentYearStart = new Date(new Date().getFullYear(), 0, 1);
        const yearlyRevenueResult = await Order.aggregate([
            {
                $match: {
                    isPaid: true,
                    createdAt: { $gte: currentYearStart }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$total' }
                }
            }
        ]);
        const totalYearlyRevenue = yearlyRevenueResult.length > 0 ? parseFloat(yearlyRevenueResult[0].total.toFixed(2)) : 0;

        res.status(200).json({
            success: true,
            data: {
                totalUsers: totalUsers,
                totalOrders,
                totalRevenue,
                totalYearlyRevenue,
                monthlyStats: formattedStats,
                revenueByCategory: formattedRevenueByCategory,
                topSellingProducts: formattedTopSellingProducts,
                ordersByStatus: formattedOrdersByStatus,
                averageOrderValue,
                newUsersPerMonth: formattedNewUsersPerMonth,
                userActivity: {
                    active: activeUsersCount,
                    inactive: inactiveUsersCount,
                    repeatCustomersCount,
                    repeatCustomerPercentage: parseFloat(repeatCustomerPercentage),
                    averageRevenuePerUser: totalRegularUsers > 0 ? parseFloat((totalRevenue / totalRegularUsers).toFixed(2)) : 0
                },
                lowStockProducts,
                mostReviewedProducts,
                dailySales: formattedDailySales,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    getDashboardStats,
};
