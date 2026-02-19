const Order = require('../models/Order');
const User = require('../models/User');

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

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                totalOrders,
                totalRevenue,
                monthlyStats: formattedStats,
                revenueByCategory: formattedRevenueByCategory,
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
