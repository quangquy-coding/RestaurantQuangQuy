import React from "react"

import { useState, useEffect } from "react"
import { Search, Plus, CheckCircle, Clock, Users } from "lucide-react"

// Mock data for tables
const mockTables = [
  {
    id: 1,
    name: "Bàn 01",
    capacity: 4,
    status: "available", // available, occupied, reserved
    location: "Tầng 1",
  },
  {
    id: 2,
    name: "Bàn 02",
    capacity: 2,
    status: "occupied",
    location: "Tầng 1",
  },
  {
    id: 3,
    name: "Bàn 03",
    capacity: 6,
    status: "reserved",
    location: "Tầng 1",
  },
  {
    id: 4,
    name: "Bàn 04",
    capacity: 4,
    status: "available",
    location: "Tầng 1",
  },
  {
    id: 5,
    name: "Bàn 05",
    capacity: 8,
    status: "available",
    location: "Tầng 2",
  },
  {
    id: 6,
    name: "Bàn 06",
    capacity: 4,
    status: "occupied",
    location: "Tầng 2",
  },
  {
    id: 6,
    name: "Bàn 06",
    capacity: 4,
    status: "occupied",
    location: "Tầng 2",
  },
  {
    id: 6,
    name: "Bàn 06",
    capacity: 4,
    status: "occupied",
    location: "Tầng 2",
  },
  {
    id: 6,
    name: "Bàn 06",
    capacity: 4,
    status: "occupied",
    location: "Tầng 2",
  },
  {
    id: 6,
    name: "Bàn 06",
    capacity: 4,
    status: "occupied",
    location: "Tầng 2",
  },
  {
    id: 6,
    name: "Bàn 06",
    capacity: 4,
    status: "occupied",
    location: "Tầng 2",
  },
  {
    id: 6,
    name: "Bàn 06",
    capacity: 4,
    status: "occupied",
    location: "Tầng 2",
  },
  {
    id: 6,
    name: "Bàn 06",
    capacity: 4,
    status: "occupied",
    location: "Tầng 2",
  },
  {
    id: 6,
    name: "Bàn 06",
    capacity: 4,
    status: "occupied",
    location: "Tầng 2",
  },
  {
    id: 6,
    name: "Bàn 06",
    capacity: 4,
    status: "occupied",
    location: "Tầng 2",
  },
  {
    id: 6,
    name: "Bàn 06",
    capacity: 4,
    status: "occupied",
    location: "Tầng 2",
  },
  {
    id: 6,
    name: "Bàn 06",
    capacity: 4,
    status: "occupied",
    location: "Tầng 2",
  },
  {
    id: 6,
    name: "Bàn 06",
    capacity: 4,
    status: "occupied",
    location: "Tầng 2",
  },
  {
    id: 6,
    name: "Bàn 06",
    capacity: 4,
    status: "occupied",
    location: "Tầng 2",
  },
  {
    id: 6,
    name: "Bàn 06",
    capacity: 4,
    status: "occupied",
    location: "Tầng 2",
  },
  {
    id: 6,
    name: "Bàn 06",
    capacity: 4,
    status: "occupied",
    location: "Tầng 2",
  },
  {
    id: 6,
    name: "Bàn 06",
    capacity: 4,
    status: "occupied",
    location: "Tầng 2",
  },

]

// Mock data for menu items
const mockMenuItems = [
  {
    id: 1,
    name: "Phở bò tái",
    category: "Món chính",
    price: 85000,
    isAvailable: true,
  },
  {
    id: 2,
    name: "Gỏi cuốn tôm thịt",
    category: "Món khai vị",
    price: 65000,
    isAvailable: true,
  },
  {
    id: 3,
    name: "Cơm rang hải sản",
    category: "Món chính",
    price: 95000,
    isAvailable: true,
  },
  {
    id: 4,
    name: "Chè khúc bạch",
    category: "Món tráng miệng",
    price: 45000,
    isAvailable: true,
  },
  {
    id: 5,
    name: "Trà đào cam sả",
    category: "Đồ uống",
    price: 35000,
    isAvailable: true,
  },
]

// Mock data for active orders
const mockActiveOrders = [
  {
    id: "OD123457",
    tableId: 2,
    tableName: "Bàn 02",
    customerName: "Trần Thị B",
    guestCount: 2,
    orderTime: "2023-06-15T19:15:00",
    status: "processing", // pending, processing, ready, served
    items: [
      { id: 1, menuItemId: 3, name: "Cơm rang hải sản", quantity: 2, price: 95000, status: "processing" },
      { id: 2, menuItemId: 4, name: "Chè khúc bạch", quantity: 2, price: 45000, status: "pending" },
      { id: 3, menuItemId: 5, name: "Cà phê sữa đá", quantity: 2, price: 30000, status: "ready" },
    ],
  },
  {
    id: "OD123458",
    tableId: 6,
    tableName: "Bàn 06",
    customerName: "Lê Văn C",
    guestCount: 4,
    orderTime: "2023-06-15T20:00:00",
    status: "pending",
    items: [
      { id: 1, menuItemId: 1, name: "Phở bò tái", quantity: 3, price: 85000, status: "pending" },
      { id: 2, menuItemId: 2, name: "Gỏi cuốn tôm thịt", quantity: 2, price: 65000, status: "pending" },
      { id: 3, menuItemId: 5, name: "Trà đào cam sả", quantity: 4, price: 35000, status: "pending" },
    ],
  },
]

const StaffOrdersPage = () => {
  const [tables, setTables] = useState([])
  const [menuItems, setMenuItems] = useState([])
  const [activeOrders, setActiveOrders] = useState([])
  const [selectedTable, setSelectedTable] = useState(null)
  const [selectedLocation, setSelectedLocation] = useState("")
  const [isCreateOrderModalOpen, setIsCreateOrderModalOpen] = useState(false)
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false)
  const [newOrder, setNewOrder] = useState({
    tableId: "",
    customerName: "",
    guestCount: 1,
    items: [],
  })
  const [selectedCategory, setSelectedCategory] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredMenuItems, setFilteredMenuItems] = useState([])
  const [selectedMenuItem, setSelectedMenuItem] = useState(null)
  const [itemQuantity, setItemQuantity] = useState(1)

  useEffect(() => {
    // In a real app, you would fetch data from an API
    setTables(mockTables)
    setMenuItems(mockMenuItems)
    setActiveOrders(mockActiveOrders)
  }, [])

  useEffect(() => {
    // Filter menu items based on category and search term
    let filtered = menuItems

    if (selectedCategory) {
      filtered = filtered.filter((item) => item.category === selectedCategory)
    }

    if (searchTerm) {
      filtered = filtered.filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    // Only show available items
    filtered = filtered.filter((item) => item.isAvailable)

    setFilteredMenuItems(filtered)
  }, [selectedCategory, searchTerm, menuItems])

  const handleTableSelect = (table) => {
    // Check if table already has an active order
    const existingOrder = activeOrders.find((order) => order.tableId === table.id)

    if (existingOrder) {
      // If table has an active order, select it
      setSelectedTable(table)
    } else {
      // If table doesn't have an active order, open create order modal
      setSelectedTable(table)
      setNewOrder({
        ...newOrder,
        tableId: table.id,
      })
      setIsCreateOrderModalOpen(true)
    }
  }

  const handleCreateOrder = () => {
    // Validate required fields
    if (!newOrder.customerName) {
      alert("Vui lòng nhập tên khách hàng")
      return
    }

    // Create new order
    const newOrderId = "OD" + Math.floor(100000 + Math.random() * 900000)
    const selectedTableObj = tables.find((table) => table.id === newOrder.tableId)

    const order = {
      id: newOrderId,
      tableId: newOrder.tableId,
      tableName: selectedTableObj.name,
      customerName: newOrder.customerName,
      guestCount: newOrder.guestCount,
      orderTime: new Date().toISOString(),
      status: "pending",
      items: [],
    }

    // Add new order to active orders
    setActiveOrders([...activeOrders, order])

    // Update table status
    const updatedTables = tables.map((table) =>
      table.id === newOrder.tableId ? { ...table, status: "occupied" } : table,
    )
    setTables(updatedTables)

    // Reset form and close modal
    setNewOrder({
      tableId: "",
      customerName: "",
      guestCount: 1,
      items: [],
    })
    setIsCreateOrderModalOpen(false)
  }

  const handleAddMenuItem = () => {
    if (!selectedMenuItem || itemQuantity < 1) return

    // Find the order for the selected table
    const orderIndex = activeOrders.findIndex((order) => order.tableId === selectedTable.id)

    if (orderIndex === -1) return

    // Create new item
    const newItem = {
      id: Date.now(),
      menuItemId: selectedMenuItem.id,
      name: selectedMenuItem.name,
      quantity: itemQuantity,
      price: selectedMenuItem.price,
      status: "pending",
    }

    // Add item to order
    const updatedOrders = [...activeOrders]
    updatedOrders[orderIndex].items.push(newItem)
    setActiveOrders(updatedOrders)

    // Reset form and close modal
    setSelectedMenuItem(null)
    setItemQuantity(1)
    setIsAddItemModalOpen(false)
  }

  const handleUpdateItemStatus = (orderId, itemId, newStatus) => {
    // Update item status
    const updatedOrders = activeOrders.map((order) => {
      if (order.id === orderId) {
        const updatedItems = order.items.map((item) => (item.id === itemId ? { ...item, status: newStatus } : item))
        return { ...order, items: updatedItems }
      }
      return order
    })

    setActiveOrders(updatedOrders)
  }

  const handleUpdateOrderStatus = (orderId, newStatus) => {
    // Update order status
    const updatedOrders = activeOrders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order))

    setActiveOrders(updatedOrders)
  }

  const handleCompleteOrder = (orderId) => {
    // Remove order from active orders
    const updatedOrders = activeOrders.filter((order) => order.id !== orderId)

    // Get the order to complete
    const orderToComplete = activeOrders.find((order) => order.id === orderId)

    // Update table status
    const updatedTables = tables.map((table) =>
      table.id === orderToComplete.tableId ? { ...table, status: "available" } : table,
    )

    setActiveOrders(updatedOrders)
    setTables(updatedTables)
    setSelectedTable(null)
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="mr-1 h-3 w-3" />
            Chờ xử lý
          </span>
        )
      case "processing":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock className="mr-1 h-3 w-3" />
            Đang xử lý
          </span>
        )
      case "ready":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="mr-1 h-3 w-3" />
            Sẵn sàng phục vụ
          </span>
        )
      case "served":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            <CheckCircle className="mr-1 h-3 w-3" />
            Đã phục vụ
          </span>
        )
      default:
        return null
    }
  }

  const getTableStatusClass = (status) => {
    switch (status) {
      case "available":
        return "bg-green-100 border-green-500 hover:bg-green-200"
      case "occupied":
        return "bg-red-100 border-red-500 hover:bg-red-200"
      case "reserved":
        return "bg-yellow-100 border-yellow-500 hover:bg-yellow-200"
      default:
        return "bg-gray-100 border-gray-500 hover:bg-gray-200"
    }
  }

  const calculateOrderTotal = (items) => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý đơn hàng</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tables section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="font-bold">Danh sách bàn</h2>
            </div>

            <div className="p-4">
              <div className="mb-4">
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tất cả vị trí</option>
                  {Array.from(new Set(tables.map((table) => table.location))).map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {tables
                  .filter((table) => !selectedLocation || table.location === selectedLocation)
                  .map((table) => (
                    <div
                      key={table.id}
                      onClick={() => handleTableSelect(table)}
                      className={`border-2 rounded-lg p-3 cursor-pointer transition-colors ${
                        selectedTable && selectedTable.id === table.id ? "ring-2 ring-blue-500" : ""
                      } ${getTableStatusClass(table.status)}`}
                    >
                      <div className="font-bold">{table.name}</div>
                      <div className="flex items-center text-sm">
                        <Users className="h-4 w-4 mr-1" />
                        {table.capacity}
                      </div>
                      <div className="text-xs mt-1">
                        {table.status === "available" && "Trống"}
                        {table.status === "occupied" && "Đang sử dụng"}
                        {table.status === "reserved" && "Đã đặt trước"}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Order details section */}
        <div className="lg:col-span-2">
          {selectedTable ? (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 border-b flex justify-between items-center">
                <div>
                  <h2 className="font-bold">{selectedTable.name}</h2>
                  <p className="text-sm text-gray-500">{selectedTable.location}</p>
                </div>

                {/* Check if table has an active order */}
                {activeOrders.some((order) => order.tableId === selectedTable.id) ? (
                  <button
                    onClick={() => setIsAddItemModalOpen(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Thêm món
                  </button>
                ) : (
                  <button
                    onClick={() => setIsCreateOrderModalOpen(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Tạo đơn hàng
                  </button>
                )}
              </div>

              {/* Order details */}
              {activeOrders.some((order) => order.tableId === selectedTable.id) ? (
                <div>
                  {activeOrders
                    .filter((order) => order.tableId === selectedTable.id)
                    .map((order) => (
                      <div key={order.id}>
                        <div className="p-4 bg-gray-50">
                          <div className="flex justify-between items-center mb-2">
                            <div>
                              <span className="font-medium">Khách hàng: </span>
                              <span>{order.customerName}</span>
                            </div>
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-1" />
                              <span>{order.guestCount} người</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="font-medium">Mã đơn: </span>
                              <span>{order.id}</span>
                            </div>
                            <div>{getStatusBadge(order.status)}</div>
                          </div>
                        </div>

                        <div className="p-4">
                          <h3 className="font-medium mb-2">Danh sách món</h3>

                          {order.items.length === 0 ? (
                            <div className="text-center py-4 text-gray-500">Chưa có món ăn nào</div>
                          ) : (
                            <div className="space-y-3">
                              {order.items.map((item) => (
                                <div key={item.id} className="flex justify-between items-center p-3 border rounded-md">
                                  <div>
                                    <div className="font-medium">{item.name}</div>
                                    <div className="text-sm text-gray-500">
                                      {item.quantity} x {item.price.toLocaleString("vi-VN")} ₫
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    {getStatusBadge(item.status)}

                                    <div className="flex gap-1">
                                      {item.status === "pending" && (
                                        <button
                                          onClick={() => handleUpdateItemStatus(order.id, item.id, "processing")}
                                          className="p-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                                          title="Bắt đầu chế biến"
                                        >
                                          <Clock className="h-4 w-4" />
                                        </button>
                                      )}

                                      {item.status === "processing" && (
                                        <button
                                          onClick={() => handleUpdateItemStatus(order.id, item.id, "ready")}
                                          className="p-1 bg-green-100 text-green-600 rounded hover:bg-green-200"
                                          title="Sẵn sàng phục vụ"
                                        >
                                          <CheckCircle className="h-4 w-4" />
                                        </button>
                                      )}

                                      {item.status === "ready" && (
                                        <button
                                          onClick={() => handleUpdateItemStatus(order.id, item.id, "served")}
                                          className="p-1 bg-purple-100 text-purple-600 rounded hover:bg-purple-200"
                                          title="Đã phục vụ"
                                        >
                                          <CheckCircle className="h-4 w-4" />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="p-4 border-t">
                          <div className="flex justify-between items-center mb-4">
                            <div className="font-bold">Tổng cộng:</div>
                            <div className="font-bold text-lg">
                              {calculateOrderTotal(order.items).toLocaleString("vi-VN")} ₫
                            </div>
                          </div>

                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleCompleteOrder(order.id)}
                              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                            >
                              Hoàn thành đơn hàng
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  <p>Bàn này chưa có đơn hàng</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
              <p>Vui lòng chọn một bàn để xem chi tiết</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Order Modal */}
      {isCreateOrderModalOpen && selectedTable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Tạo đơn hàng mới</h2>
            </div>

            <div className="p-6">
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bàn</label>
                  <input
                    type="text"
                    value={selectedTable.name}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên khách hàng *</label>
                  <input
                    type="text"
                    value={newOrder.customerName}
                    onChange={(e) => setNewOrder({ ...newOrder, customerName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng khách</label>
                  <input
                    type="number"
                    min="1"
                    value={newOrder.guestCount}
                    onChange={(e) => setNewOrder({ ...newOrder, guestCount: Number.parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setIsCreateOrderModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleCreateOrder}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Tạo đơn hàng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {isAddItemModalOpen && selectedTable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Thêm món ăn</h2>
            </div>

            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
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

                <div className="w-full md:w-48">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Tất cả danh mục</option>
                    {Array.from(new Set(menuItems.map((item) => item.category))).map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {filteredMenuItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedMenuItem(item)}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedMenuItem && selectedMenuItem.id === item.id
                        ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="font-bold">{item.name}</div>
                    <div className="text-sm text-gray-500">{item.category}</div>
                    <div className="mt-2 font-medium">{item.price.toLocaleString("vi-VN")} ₫</div>
                  </div>
                ))}
              </div>

              {selectedMenuItem && (
                <div className="border-t pt-4">
                  <h3 className="font-medium mb-2">Món đã chọn: {selectedMenuItem.name}</h3>

                  <div className="flex items-center gap-4">
                    <label className="block text-sm font-medium text-gray-700">Số lượng:</label>
                    <input
                      type="number"
                      min="1"
                      value={itemQuantity}
                      onChange={(e) => setItemQuantity(Number.parseInt(e.target.value) || 1)}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => {
                  setSelectedMenuItem(null)
                  setItemQuantity(1)
                  setIsAddItemModalOpen(false)
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleAddMenuItem}
                disabled={!selectedMenuItem}
                className={`px-4 py-2 rounded-md ${
                  selectedMenuItem
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Thêm món
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StaffOrdersPage
