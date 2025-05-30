import axios from "axios";

const API_BASE_URL = "http://localhost:5080/api";

// Lấy tất cả đơn hàng (Admin)
export const getAllOrders = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/OrderManagement/all`);
    if (!response.ok) {
      throw new Error("Failed to fetch orders");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
};

// Lấy đơn hàng theo ID khách hàng
export const getOrdersByCustomerId = async (customerId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/OrderManagement/customer/${customerId}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch customer orders");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching customer orders:", error);
    throw error;
  }
};

// Lấy bàn trống theo thời gian
export const getAvailableTables = async (dateTime = null) => {
  try {
    let url = `${API_BASE_URL}/OrderManagement/available-tables`;

    if (dateTime) {
      url += `?dateTime=${encodeURIComponent(dateTime.toISOString())}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch available tables");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching available tables:", error);
    throw error;
  }
};

// Lấy menu items
export const getMenuItems = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/OrderManagement/menu-items`);
    if (!response.ok) {
      throw new Error("Failed to fetch menu items");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching menu items:", error);
    throw error;
  }
};

// Cập nhật trạng thái đơn hàng
export const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/OrderManagement/${orderId}/status`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: status,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update order status");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
};

// Gán bàn cho đơn hàng
export const assignTableToOrder = async (orderId, tableId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/OrderManagement/${orderId}/assign-table`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tableId: tableId,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to assign table");
    }

    return await response.json();
  } catch (error) {
    console.error("Error assigning table:", error);
    throw error;
  }
};

// Tạo đơn hàng mới
export const createOrder = async (orderData) => {
  try {
    console.log("Creating order with data:", JSON.stringify(orderData));

    const response = await fetch(`${API_BASE_URL}/OrderManagement`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error("Server error response:", responseText);
      throw new Error(`Failed to create order: ${responseText}`);
    }

    try {
      return JSON.parse(responseText);
    } catch (e) {
      console.warn("Could not parse response as JSON:", responseText);
      return { message: responseText };
    }
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

// Cập nhật đơn hàng
export const updateOrder = async (orderId, orderData) => {
  try {
    console.log("Updating order with data:", JSON.stringify(orderData));

    const response = await fetch(`${API_BASE_URL}/OrderManagement/${orderId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error("Server error response:", responseText);
      throw new Error(`Failed to update order: ${responseText}`);
    }

    try {
      return JSON.parse(responseText);
    } catch (e) {
      console.warn("Could not parse response as JSON:", responseText);
      return { message: responseText };
    }
  } catch (error) {
    console.error("Error updating order:", error);
    throw error;
  }
};

// Xóa đơn hàng
export const deleteOrder = async (orderId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/OrderManagement/${orderId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete order");
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting order:", error);
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
