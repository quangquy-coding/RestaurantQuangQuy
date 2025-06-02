export const getAllDanhGia = async () => {
  const response = await fetch("http://localhost:5080/api/DanhGiaManager", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Lỗi khi lấy danh sách đánh giá");
  }
  return response.json();
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
    const errorData = await response.json();
    throw new Error(errorData.message || "Lỗi khi gửi đánh giá");
  }
  return response.json();
};
