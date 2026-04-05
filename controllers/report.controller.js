const Order = require('../schemas/Order');
const exceljs = require('exceljs');

// Export Excel Report
exports.exportOrdersExcel = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'email firstName lastName')
      .sort({ createdAt: -1 });

    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet('Orders Report');

    worksheet.columns = [
      { header: 'Order ID', key: '_id', width: 25 },
      { header: 'Customer Email', key: 'email', width: 25 },
      { header: 'Total Value', key: 'totalAmount', width: 15 },
      { header: 'Payment Status', key: 'paymentStatus', width: 15 },
      { header: 'Order Status', key: 'status', width: 15 },
      { header: 'Created At', key: 'createdAt', width: 20 },
    ];

    orders.forEach(order => {
      worksheet.addRow({
        _id: order._id.toString(),
        email: order.user ? order.user.email : 'N/A',
        totalAmount: order.totalAmount,
        paymentStatus: order.paymentStatus,
        status: order.status || order.orderStatus,
        createdAt: order.createdAt.toISOString().split('T')[0]
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=orders_report.xlsx');

    await workbook.xlsx.write(res);
    res.status(200).end();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
