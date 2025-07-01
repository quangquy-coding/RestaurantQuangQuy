export const getAllDanhGia = async () => {
  const response = await fetch(
    import.meta.env.VITE_API_BASE_URL + "/DanhGiaManager",
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = {
        message: response.statusText || "Lỗi khi lấy danh sách đánh giá",
      };
    }
    throw new Error(errorData.message || "Lỗi khi lấy danh sách đánh giá");
  }
  return await response.json();
};

export const themDanhGia = async (danhGia) => {
  const response = await fetch("http://localhost:5080/api/DanhGiaManager", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(danhGia),
  });
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: response.statusText || "Lỗi khi gửi đánh giá" };
    }
    throw new Error(errorData.message || "Lỗi khi gửi đánh giá");
  }
  return await response.json();
};
