import axios from "axios";

const API_BASE_URL = "http://localhost:5080/api";

// Lấy tất cả đơn hàng (Admin)
export const getAllOrders = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/OrderManagement/all`);
    return response.data;
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
};

// Get orders by customer
export const getOrdersByCustomer = async (customerId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/OrderManagement/customer/${customerId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching customer orders:", error);
    throw error;
  }
};

// Get available tables
export const getAvailableTables = async (dateTime = null) => {
  try {
    const params = dateTime ? { dateTime: dateTime.toISOString() } : {};
    const response = await axios.get(
      `${API_BASE_URL}/OrderManagement/available-tables`,
      { params }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching available tables:", error);
    throw error;
  }
};

// Get menu items
export const getMenuItems = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/OrderManagement/menu-items`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching menu items:", error);
    throw error;
  }
};

// Update order status
export const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/OrderManagement/${orderId}/status`,
      {
        status: status,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
};

// Update order food status
export const updateOrderFoodStatus = async (orderId, status) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/OrderManagement/${orderId}/food-status`,
      {
        status: status,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating order food status:", error);
    throw error;
  }
};

// Assign table to order
export const assignTableToOrder = async (orderId, tableId) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/OrderManagement/${orderId}/assign-table`,
      {
        tableId: tableId,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error assigning table:", error);
    throw error;
  }
};

// Create new order
export const createOrder = async (orderData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/OrderManagement`, {
      customerName: orderData.customerName,
      customerPhone: orderData.customerPhone,
      customerEmail: orderData.customerEmail,
      tableIds: orderData.tableIds,
      orderDate: orderData.orderDate,
      arrivalTime: orderData.arrivalTime,
      guestCount: orderData.guestCount,
      paymentMethod: orderData.paymentMethod,
      notes: orderData.notes,
      items: orderData.items,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

// Update order
export const updateOrder = async (orderId, orderData) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/OrderManagement/${orderId}`,
      orderData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating order:", error);
    throw error;
  }
};

// Delete order
export const deleteOrder = async (orderId) => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/OrderManagement/${orderId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting order:", error);
    throw error;
  }
};

// Export invoice PDF
export const exportInvoicePdf = async (orderId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/OrderManagement/${orderId}/export-pdf`,
      {
        responseType: "blob",
      }
    );
    return response;
  } catch (error) {
    console.error("Error exporting PDF:", error);
    throw error;
  }
};

// Send invoice email
export const sendInvoiceEmail = async (orderId, emailData) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/OrderManagement/${orderId}/send-invoice`,
      emailData
    );
    return response.data;
  } catch (error) {
    console.error("Error sending invoice email:", error);
    throw error;
  }
};
export const orderService = {
  createDatMon: (datMonDTO) =>
    axios.post(`${API_BASE_URL}/DatMon/CreateDatMon`, datMonDTO),

  createHoaDon: (hoaDonDTO) =>
    axios.post(`${API_BASE_URL}/HoaDonThanhToan/CreateHoaDon`, hoaDonDTO),

  deleteDatMon: (maDatMon) =>
    axios.delete(`${API_BASE_URL}/DatMon/DeleteDatMon/${maDatMon}`),
};
