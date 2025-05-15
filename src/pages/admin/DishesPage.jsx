import React from "react"
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useState, useEffect } from "react"
import { Search, Plus, Edit, Trash2, Eye, Upload,Download } from "lucide-react"
import { getDishes, addDish, updateDish, deleteDish,getCategories} from "../api/dishApi"






const DishesPage = () => {
  const [categories, setCategories] = useState([]);
  const [dishes, setDishes] = useState([])
  const [filteredDishes, setFilteredDishes] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [currentDish, setCurrentDish] = useState(null)
  const [newDish, setNewDish] = useState({
  tenMon: "",
  maDanhMuc: "",
  gia: "",
  moTa: "", 
  hinhAnh: "/placeholder.svg?height=80&width=80",
  thoiGianMon: "",
  thanhPhan: "",
  dinhDuong: "",
  diUng: "",
  isAvailable: true,
  isSpecial: false,
  isNew: false,
});
  const handleInputChange = (e) => {
  const { name, value, type, checked } = e.target;
  setNewDish((prev) => ({
    ...prev,
    [name]: type === "checkbox" ? checked : value,
  }));
};

function getSafeImageSrc(src) {
  if (
    typeof src === "string" &&
    src.startsWith("data:image/") &&
    src.length > 30 // base64 tối thiểu phải dài
  ) {
    return src;
  }
  return "/placeholder.svg";
}
const handleAddDish = async () => {
  if (!newDish.tenMon || !newDish.maDanhMuc || !newDish.gia || !newDish.moTa || !newDish.hinhAnh)  {
    alert("Vui lòng điền đầy đủ thông tin bắt buộc");
    return;
  }

  const dishToAdd = {
    tenMon: newDish.tenMon,
    maDanhMuc: newDish.maDanhMuc,
    gia: Number(newDish.gia),
    thoiGianMon: newDish.thoiGianMon,
    moTa: newDish.moTa,
    thanhPhan: newDish.thanhPhan,
    dinhDuong: newDish.dinhDuong,
    diUng: newDish.diUng,

    hinhAnh: newDish.hinhAnh,
    tinhTrang: newDish.isSpecial
      ? "Món đặc biệt"
      : newDish.isNew
      ? "Món mới"
      : newDish.isAvailable
      ? "Còn hàng"
      : "Hết hàng",
  };

  try {
    await addDish(dishToAdd);
    // Gọi lại API lấy danh sách món ăn mới nhất
    const res = await getDishes();
    setDishes(res.data);
    setFilteredDishes(res.data);
    alert("Thêm món ăn thành công!");

    setNewDish({
      tenMon: "",
      maDanhMuc: "",
      gia: "",
      thoiGianMon: "",
      moTa: "",
      thanhPhan: "",
      dinhDuong: "",
      diUng: "",

      hinhAnh: "/placeholder.svg?height=80&width=80",
      isAvailable: true,
      isSpecial: false,
      isNew: false,
    });

    setIsAddModalOpen(false);
  } catch (err) {
    alert(
      "Lỗi khi thêm món ăn: " +
        JSON.stringify(
          err.response?.data?.errors ||
          err.response?.data ||
          err.message
        )
    );
    console.error(err);
  }
};

  const handleNewDishImageUpload = (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewDish((prev) => ({
        ...prev,
        hinhAnh: reader.result, // base64
      }));
    };
    reader.readAsDataURL(file);
  }
};



useEffect(() => {
  const fetchCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res.data);
      setFilteredDishes(res.data);
    } catch (err) {
      alert("Lỗi khi lấy danh mục món ăn");
      console.error(err);
    }
  }
  fetchCategories();
},[])


// getDishes
useEffect(()=>{
  const fetchDishes = async () => {
    try {
      const res = await getDishes();
      setDishes(res.data);
      setFilteredDishes(res.data);
    } catch (err) {
      alert("Lỗi khi lấy danh sách món ăn");
      console.error(err);
    }
  }
  fetchDishes();
},[])
// lọc 
  useEffect(() => {
    // Filter dishes based on search term and category
    let filtered = dishes

    if (searchTerm) {
      filtered = filtered.filter(
        (dish) =>
          dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dish.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedCategory) {
      filtered = filtered.filter((dish) => dish.category === selectedCategory)
    }

    setFilteredDishes(filtered)
  }, [searchTerm, selectedCategory, dishes])




  // Cập nhật món ăn
  const handleEditDishInputChange = (e) => {
  const { name, value, type, checked } = e.target;
  setCurrentDish((prev) => ({
    ...prev,
    [name]: type === "checkbox" ? checked : value,
  }));
};

const handleEditDish = async () => {
  if (!currentDish.tenMon || !currentDish.maDanhMuc || currentDish.gia <= 0 || !currentDish.moTa || !currentDish.hinhAnh) {
    alert("Vui lòng điền đầy đủ thông tin bắt buộc");
    return;
  }

  // Xác định lại trường tinhTrang
  let tinhTrang = "Hết hàng";
  if (currentDish.isSpecial) tinhTrang = "Món đặc biệt";
  else if (currentDish.isNew) tinhTrang = "Món mới";
  else if (currentDish.isAvailable) tinhTrang = "Còn hàng";

  try {
    const res = await updateDish(currentDish.maMon, {
      ...currentDish,
      gia: Number(currentDish.gia),
      tinhTrang, // cập nhật trạng thái đúng
    });

    // Gọi lại API lấy danh sách món ăn mới nhất để tự render lại
    const dishesRes = await getDishes();
    setDishes(dishesRes.data);
    setFilteredDishes(dishesRes.data);

    setCurrentDish(null);
    setIsEditModalOpen(false);
    alert("Cập nhật món ăn thành công!");
  } catch (err) {
    alert("Lỗi khi cập nhật món ăn");
    console.error(err);
  }
};

const handleDeleteDish = async () => {
  if (!currentDish) return;

  try {
    // Gọi API xóa món ăn theo mã món
    await deleteDish(currentDish.maMon);

    // Sau khi xóa thành công, gọi lại API lấy danh sách món ăn mới nhất
    const res = await getDishes();
    setDishes(res.data);
    setFilteredDishes(res.data);

    alert("Xóa món ăn thành công!");
  } catch (err) {
    alert("Lỗi khi xóa món ăn");
    console.error(err);
  }

  // Reset và đóng modal
  setCurrentDish(null);
  setIsDeleteModalOpen(false);
};

  const openViewModal = (dish) => {
    setCurrentDish(dish)
    setIsViewModalOpen(true)
  }

 const openEditModal = (dish) => {
  setCurrentDish({
    ...dish,
    isAvailable: dish.tinhTrang === "Còn hàng",
    isSpecial: dish.tinhTrang === "Món đặc biệt",
    isNew: dish.tinhTrang === "Món mới",
  });
  setIsEditModalOpen(true);
};

  const openDeleteModal = (dish) => {
    setCurrentDish(dish)
    setIsDeleteModalOpen(true)
  }

    const handleExportExcel = () => {
      const exportData = dishes.map((e, index) => ({
        STT: index + 1,
        "Hình ảnh" : e.image,
        "Tên món ăn": e.name,
        "Mô tả": e.description,
        "Danh mục": e.name,

        "Giá": e.gia?.toLocaleString("vi-VN") + " ₫" || "0 ₫",

        "Trạng thái": [
        e.isAvailable ? "Còn hàng" : "Hết hàng",
        e.isNew ? " Mới" : null,
        e.isSpecial ? "Đặc biệt" : null
        ]
        .filter(Boolean) // loại bỏ null
        .join(" - ") 
       
       
       
     
   
     
      }));
    
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "DanhSachMonAn");
    
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
    
      const file = new Blob([excelBuffer], {
        type: "application/octet-stream",
      });
    
      saveAs(file, "DanhSachMonAn.xlsx");
    };

    const handleEditDishImageUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setCurrentDish((prev) => ({
            ...prev,
            hinhAnh: reader.result,
          }));
        };
        reader.readAsDataURL(file);
      }
    };
    
    

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Quản lý món ăn</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
        >
          <Plus className="mr-2 h-5 w-5" />
          Thêm món ăn
        </button>
      </div>

      {/* Search and filter */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Tìm kiếm món ăn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>

          <div className="w-full md:w-64">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả danh mục</option>
         {Array.isArray(categories) && categories.map((cat) => (
  <option key={cat.maDanhMuc} value={cat.maDanhMuc}>
    {cat.tenDanhMuc}
  </option>
))}
            </select>


            
          </div>
          
          <button className="flex items-center px-4 py-2 text-gray-700 bg-white border rounded-lg hover:bg-gray-50" onClick={handleExportExcel}>
          <Download className="w-4 h-4 mr-2" />
          Xuất Excel
          </button>
          </div>
      </div>

      {/* Dishes table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Món ăn
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Giá
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Thời gian món
                </th>
                  <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Thành phần
                </th>
                  <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Thông tin dinh dưỡng
                </th>
                  <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Chứa dị ứng
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Danh mục
                </th>
                 <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Mã danh mục
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Trạng thái
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDishes.map((dish, index) => (
                <tr key={dish.maMon || index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                <img
                  src={getSafeImageSrc(dish.hinhAnh)}
                  alt={dish.tenMon}
                  className="h-10 w-10 rounded-full object-cover"
                />
                    </div>
                    <div className="ml-4">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {dish.maMon}
                      </span>
                      <div className="text-sm font-medium text-gray-900">{dish.tenMon}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">{dish.moTa}</div>
                    </div>
                  </div>
                </td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {typeof dish.gia === "number"
                    ? dish.gia.toLocaleString("vi-VN") + " ₫"
                    : "0 ₫"}
           
                    

                  </td>
                   <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {dish.thoiGianMon}
                    </span>
                  </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {dish.thanhPhan}
                    </span>
                  </td>
                  
                       <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {dish.dinhDuong}
                    </span>
                  </td>
                       <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {dish.diUng}
                    </span>
                  </td>
                  
                  
                     
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {dish.tenDanhMuc}
                    </span>
                  </td>
                   <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {dish.maDanhMuc}
                    </span>
                  </td>
                 
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {{
                        "Còn hàng": (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Còn hàng
                          </span>
                        ),
                        "Món đặc biệt": (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                            Món đặc biệt
                          </span>
                        ),
                        "Món mới": (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Món mới
                          </span>
                        ),
                      }[dish.tinhTrang] || (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Hết hàng
                        </span>
                      )}
                    </div>
                  </td>


                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => openViewModal(dish)} className="text-indigo-600 hover:text-indigo-900 mr-3">
                      <Eye className="h-5 w-5" />
                    </button>
                    <button onClick={() => openEditModal(dish)} className="text-blue-600 hover:text-blue-900 mr-3">
                      <Edit className="h-5 w-5" />
                    </button>
                    <button onClick={() => openDeleteModal(dish)} className="text-red-600 hover:text-red-900">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Dish Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Thêm món ăn mới</h2>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên món ăn *</label>
                  <input
                    type="text"
                    name="tenMon"
                    value={newDish.tenMon}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục *</label>
                      <select
                      name="maDanhMuc"
                      value={newDish.maDanhMuc}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    >
                      <option value="">Chọn danh mục</option>
                      {Array.isArray(categories) &&
                        categories.map((cat) => (
                          <option key={cat.maDanhMuc} value={cat.maDanhMuc}>
                            {cat.tenDanhMuc}
                          </option>
                        ))}
                    </select>

                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá (VNĐ) *</label>
                  <input
                    type="number"
                    name="gia"
                    value={newDish.gia}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
                 <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian món *</label>
                  <input
                    type="text"
                    name="thoiGianMon"
                    value={newDish.thoiGianMon}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hình ảnh</label>

                <label htmlFor="upload-image" className="cursor-pointer inline-block bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
                  Chọn ảnh
                </label>

                <input
                  type="file"
                  name="hinhAnh"
                  accept="image/*"
                  onChange={handleNewDishImageUpload}
                  className="hidden"
                  id="upload-image"
                />

                {newDish.hinhAnh && (
                  <img
                    src={newDish.hinhAnh}
                    alt="Xem trước"
                    className="w-24 h-24 mt-2 object-cover rounded-md"
                  />
                )}
              </div>
              


                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                  <textarea
                    name="moTa"
                    value={newDish.moTa}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  ></textarea>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thành phần</label>
                  <textarea
                    name="thanhPhan"
                    value={newDish.thanhPhan}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  ></textarea>
                </div>
                 <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dinh dưỡng</label>
                  <textarea
                    name="dinhDuong"
                    value={newDish.dinhDuong}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  ></textarea>
                </div>
                 <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chứa dị ứng</label>
                  <input
                    type="text"
                    name="diUng"
                    value={newDish.diUng}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thành phần</label>
                  <textarea
                    name="ingredients"
                    value={newDish.ingredients}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  ></textarea>
                </div> */}

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isAvailable"
                        name="isAvailable"
                        checked={newDish.isAvailable}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="isAvailable" className="ml-2 text-sm text-gray-700">
                        Còn hàng
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isSpecial"
                        name="isSpecial"
                        checked={newDish.isSpecial}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="isSpecial" className="ml-2 text-sm text-gray-700">
                        Món đặc biệt
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isNew"
                        name="isNew"
                        checked={newDish.isNew}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="isNew" className="ml-2 text-sm text-gray-700">
                        Món mới
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button onClick={handleAddDish} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Thêm món ăn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Dish Modal */}
      {isEditModalOpen && currentDish && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Chỉnh sửa món ăn</h2>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên món ăn *</label>
                  <input
                    type="text"
                    name="tenMon"
                    value={currentDish.tenMon}
                    onChange={handleEditDishInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục *</label>
                  <select
                    name="maDanhMuc"
                    value={currentDish.maDanhMuc}
                    onChange={handleEditDishInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  >
                    <option value="">Chọn danh mục</option>
             {Array.isArray(categories) && categories.map((cat) => (
  <option key={cat.maDanhMuc} value={cat.maDanhMuc}>
    {cat.tenDanhMuc}
  </option>
))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá (VNĐ) *</label>
                  <input
                    type="number"
                    name="gia"
                    value={currentDish.gia}
                    onChange={handleEditDishInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
                  <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian món</label>
                  <input
                    type="text"
                    name="thoiGianMon"
                    value={currentDish.thoiGianMon}
                    onChange={handleEditDishInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hình ảnh</label>
                  <div className="flex items-center">
                  <label className="cursor-pointer inline-block bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
                  Sửa ảnh
                  <input
                  type="file"
                  name="hinhAnh"
                  accept="image/*"
                  onChange={handleEditDishImageUpload}
                  className="hidden"
                />

        </label>
                  </div>
                  {currentDish?.hinhAnh && (
                  <img
                    src={currentDish.hinhAnh}
                    alt="Preview"
                    className="w-24 h-24 mt-2 object-cover rounded-md"
                  />
)}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                  <textarea
                    name="moTa"
                    value={currentDish.moTa}
                    onChange={handleEditDishInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  ></textarea>
                </div>
                 <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thành phần</label>
                  <textarea
                    name="thanhPhan"
                    value={currentDish.thanhPhan}
                    onChange={handleEditDishInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  ></textarea>
                </div>
                 <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dinh dưỡng</label>
                  <textarea
                    name="dinhDuong"
                    value={currentDish.dinhDuong}
                    onChange={handleEditDishInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chứa dị ứng</label>
                  <input
                    type="text"
                    name="diUng"
                    value={currentDish.diUng}
                    onChange={handleEditDishInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>

{/* 
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thành phần</label>
                  <textarea
                    name="ingredients"
                    value={currentDish.ingredients}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  ></textarea>
                </div> */}

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="edit-isAvailable"
                        name="isAvailable"
                        checked={currentDish.isAvailable}
                        onChange={handleEditDishInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="edit-isAvailable" className="ml-2 text-sm text-gray-700">
                        Còn hàng
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="edit-isSpecial"
                        name="isSpecial"
                        checked={currentDish.isSpecial}
                        onChange={handleEditDishInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="edit-isSpecial" className="ml-2 text-sm text-gray-700">
                        Món đặc biệt
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="edit-isNew"
                        name="isNew"
                        checked={currentDish.isNew}
                        onChange={handleEditDishInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="edit-isNew" className="ml-2 text-sm text-gray-700">
                        Món mới
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => {
                  setCurrentDish(null)
                  setIsEditModalOpen(false)
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleEditDish}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Dish Modal */}
      {isViewModalOpen && currentDish && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Chi tiết món ăn</h2>
            </div>

            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3">
                  <img
                    src={currentDish.image || "/placeholder.svg"}
                    alt={currentDish.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>

                <div className="md:w-2/3">
                  <h3 className="text-xl font-bold mb-2">{currentDish.name}</h3>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Danh mục</p>
                      <p className="font-medium">{currentDish.category}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Giá</p>
                      <p className="font-medium">{currentDish.price.toLocaleString("vi-VN")} ₫</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Mô tả</p>
                    <p>{currentDish.description}</p>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Thành phần</p>
                    <p>{currentDish.ingredients}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {currentDish.isAvailable ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        Còn hàng
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                        Hết hàng
                      </span>
                    )}

                    {currentDish.isSpecial && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                        Món đặc biệt
                      </span>
                    )}

                    {currentDish.isNew && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                        Món mới
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end">
              <button
                onClick={() => {
                  setCurrentDish(null)
                  setIsViewModalOpen(false)
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Dish Modal */}
      {isDeleteModalOpen && currentDish && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Xác nhận xóa</h2>
            </div>

            <div className="p-6">
              <p className="mb-4">Bạn có chắc chắn muốn xóa món ăn này? Hành động này không thể hoàn tác.</p>

              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex items-center">
                  <img
                    src={currentDish.hinhAnh || "/placeholder.svg"}
                    alt={currentDish.tenMon}
                    className="h-12 w-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h3 className="font-medium">{currentDish.tenMon}</h3>
                    <p className="text-sm text-gray-500">{currentDish.maDanhMuc}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => {
                  setCurrentDish(null)
                  setIsDeleteModalOpen(false)
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteDish}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Xóa món ăn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DishesPage
