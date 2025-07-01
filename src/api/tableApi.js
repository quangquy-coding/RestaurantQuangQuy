const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Lấy tất cả bàn
export const getAllTables = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/BanAnManager`);
    if (!response.ok) {
      throw new Error("Failed to fetch tables");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching tables:", error);
    throw error;
  }
};

// Lấy bàn trống theo thời gian
export const getAvailableTables = async (dateTime = null) => {
  try {
    let url = `${API_BASE_URL}/BanAnManager/available`;

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

// Lấy thông tin bàn theo ID
export const getTableById = async (tableId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/BanAnManager/${tableId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch table");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching table:", error);
    throw error;
  }
};

// Tạo bàn mới
export const createTable = async (tableData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/BanAnManager`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(tableData),
    });

    if (!response.ok) {
      throw new Error("Failed to create table");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating table:", error);
    throw error;
  }
};

// Cập nhật bàn
export const updateTable = async (tableId, tableData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/BanAnManager/${tableId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(tableData),
    });

    if (!response.ok) {
      throw new Error("Failed to update table");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating table:", error);
    throw error;
  }
};

// Xóa bàn
export const deleteTable = async (tableId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/BanAnManager/${tableId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete table");
    }

    return response.status === 204
      ? { message: "Table deleted successfully" }
      : await response.json();
  } catch (error) {
    console.error("Error deleting table:", error);
    throw error;
  }
};

// Tìm kiếm bàn
export const searchTables = async (searchParams) => {
  try {
    const params = new URLSearchParams();

    if (searchParams.tenBan) {
      params.append("tenBan", searchParams.tenBan);
    }

    if (searchParams.viTri) {
      params.append("viTri", searchParams.viTri);
    }

    const response = await fetch(
      `${API_BASE_URL}/BanAnManager/search?${params.toString()}`
    );
    if (!response.ok) {
      throw new Error("Failed to search tables");
    }
    return await response.json();
  } catch (error) {
    console.error("Error searching tables:", error);
    throw error;
  }
};
