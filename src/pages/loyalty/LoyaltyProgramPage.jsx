import React from "react"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Gift, Award, Star, Clock, ChevronRight, Ticket, Info, AlertCircle } from "lucide-react"

// Mock data for user loyalty
const mockUserLoyalty = {
  name: "Nguyễn Văn A",
  points: 750,
  tier: "Bạc",
  nextTier: "Vàng",
  pointsToNextTier: 250,
  memberSince: "2023-01-15",
  expiryDate: "2023-12-31",
  availableRewards: 3,
  history: [
    {
      id: 1,
      date: "2023-05-14",
      type: "earn",
      points: 150,
      description: "Đơn hàng #23456",
    },
    {
      id: 2,
      date: "2023-05-01",
      type: "earn",
      points: 200,
      description: "Đơn hàng #23400",
    },
    {
      id: 3,
      date: "2023-04-20",
      type: "redeem",
      points: -100,
      description: "Đổi ưu đãi giảm 10%",
    },
    {
      id: 4,
      date: "2023-04-15",
      type: "earn",
      points: 180,
      description: "Đơn hàng #23350",
    },
    {
      id: 5,
      date: "2023-04-01",
      type: "earn",
      points: 120,
      description: "Đơn hàng #23300",
    },
    {
      id: 6,
      date: "2023-03-15",
      type: "redeem",
      points: -150,
      description: "Đổi món tráng miệng miễn phí",
    },
    {
      id: 7,
      date: "2023-03-01",
      type: "earn",
      points: 350,
      description: "Đơn hàng #23250",
    },
  ],
}

// Mock data for rewards
const mockRewards = [
  {
    id: 1,
    name: "Giảm 10% tổng hóa đơn",
    points: 100,
    description: "Áp dụng cho đơn hàng từ 200.000đ",
    expiryDays: 30,
    category: "discount",
  },
  {
    id: 2,
    name: "Món tráng miệng miễn phí",
    points: 150,
    description: "Áp dụng cho bất kỳ món tráng miệng nào trong thực đơn",
    expiryDays: 30,
    category: "food",
  },
  {
    id: 3,
    name: "Nước uống miễn phí",
    points: 80,
    description: "Áp dụng cho bất kỳ nước uống nào trong thực đơn",
    expiryDays: 30,
    category: "drink",
  },
  {
    id: 4,
    name: "Giảm 15% tổng hóa đơn",
    points: 200,
    description: "Áp dụng cho đơn hàng từ 300.000đ",
    expiryDays: 30,
    category: "discount",
  },
  {
    id: 5,
    name: "Món khai vị miễn phí",
    points: 120,
    description: "Áp dụng cho bất kỳ món khai vị nào trong thực đơn",
    expiryDays: 30,
    category: "food",
  },
  {
    id: 6,
    name: "Giảm 20% tổng hóa đơn",
    points: 300,
    description: "Áp dụng cho đơn hàng từ 500.000đ",
    expiryDays: 30,
    category: "discount",
  },
  {
    id: 7,
    name: "Bữa ăn miễn phí cho 1 người",
    points: 1000,
    description: "Áp dụng cho bất kỳ món chính nào trong thực đơn",
    expiryDays: 60,
    category: "food",
  },
]

// Mock data for tiers
const mockTiers = [
  {
    id: 1,
    name: "Đồng",
    pointsRequired: 0,
    benefits: ["Tích 1 điểm cho mỗi 10.000đ chi tiêu", "Ưu đãi sinh nhật", "Thông báo khuyến mãi sớm"],
    color: "bg-amber-700",
  },
  {
    id: 2,
    name: "Bạc",
    pointsRequired: 500,
    benefits: [
      "Tích 1.2 điểm cho mỗi 10.000đ chi tiêu",
      "Ưu đãi sinh nhật",
      "Thông báo khuyến mãi sớm",
      "Ưu tiên đặt bàn",
    ],
    color: "bg-gray-400",
  },
  {
    id: 3,
    name: "Vàng",
    pointsRequired: 1000,
    benefits: [
      "Tích 1.5 điểm cho mỗi 10.000đ chi tiêu",
      "Ưu đãi sinh nhật đặc biệt",
      "Thông báo khuyến mãi sớm",
      "Ưu tiên đặt bàn",
      "Quà tặng hàng quý",
    ],
    color: "bg-yellow-500",
  },
  {
    id: 4,
    name: "Kim cương",
    pointsRequired: 2000,
    benefits: [
      "Tích 2 điểm cho mỗi 10.000đ chi tiêu",
      "Ưu đãi sinh nhật đặc biệt",
      "Thông báo khuyến mãi sớm",
      "Ưu tiên đặt bàn",
      "Quà tặng hàng quý",
      "Dịch vụ VIP",
      "Giảm giá 5% cho mọi đơn hàng",
    ],
    color: "bg-blue-500",
  },
]

const LoyaltyProgramPage = () => {
  const [userLoyalty, setUserLoyalty] = useState(null)
  const [rewards, setRewards] = useState([])
  const [tiers, setTiers] = useState([])
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedReward, setSelectedReward] = useState(null)
  const [showRedeemModal, setShowRedeemModal] = useState(false)
  const [redeemSuccess, setRedeemSuccess] = useState(false)

  useEffect(() => {
    // In a real app, you would fetch this data from an API
    setUserLoyalty(mockUserLoyalty)
    setRewards(mockRewards)
    setTiers(mockTiers)
  }, [])

  const handleRedeemReward = (reward) => {
    setSelectedReward(reward)
    setShowRedeemModal(true)
  }

  const confirmRedemption = () => {
    // In a real app, you would send a request to the API to redeem the reward
    // For now, we'll just update the local state
    setUserLoyalty({
      ...userLoyalty,
      points: userLoyalty.points - selectedReward.points,
      availableRewards: userLoyalty.availableRewards + 1,
      history: [
        {
          id: userLoyalty.history.length + 1,
          date: new Date().toISOString().split("T")[0],
          type: "redeem",
          points: -selectedReward.points,
          description: `Đổi ${selectedReward.name}`,
        },
        ...userLoyalty.history,
      ],
    })

    setRedeemSuccess(true)

    // Reset after 3 seconds
    setTimeout(() => {
      setShowRedeemModal(false)
      setRedeemSuccess(false)
      setSelectedReward(null)
    }, 3000)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date)
  }

  if (!userLoyalty) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  // Find current tier and next tier
  const currentTier = tiers.find((tier) => tier.name === userLoyalty.tier)
  const nextTierIndex = tiers.findIndex((tier) => tier.name === userLoyalty.tier) + 1
  const nextTier = nextTierIndex < tiers.length ? tiers[nextTierIndex] : null

  // Calculate progress percentage to next tier
  const progressPercentage = nextTier
    ? ((userLoyalty.points - currentTier.pointsRequired) / (nextTier.pointsRequired - currentTier.pointsRequired)) * 100
    : 100

  return (
    <div className="min-h-screen bg-red-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Chương trình khách hàng thân thiết</h1>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === "overview"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Tổng quan
            </button>
            <button
              onClick={() => setActiveTab("rewards")}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === "rewards"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Đổi ưu đãi
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === "history"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Lịch sử
            </button>
            <button
              onClick={() => setActiveTab("tiers")}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === "tiers" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Hạng thành viên
            </button>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* User info card */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-xl font-bold mb-1">{userLoyalty.name}</h2>
                    <div className="flex items-center">
                      <div className={`h-4 w-4 rounded-full ${currentTier.color} mr-2`}></div>
                      <span className="text-sm font-medium">Hạng {userLoyalty.tier}</span>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <div className="text-sm text-gray-500">Thành viên từ {formatDate(userLoyalty.memberSince)}</div>
                    <div className="text-sm text-gray-500">
                      Điểm tích lũy hết hạn: {formatDate(userLoyalty.expiryDate)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-6 border-t">
                <div className="flex flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <div className="text-sm text-gray-500">Điểm hiện tại</div>
                    <div className="text-3xl font-bold">{userLoyalty.points}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Ưu đãi khả dụng</div>
                    <div className="text-3xl font-bold">{userLoyalty.availableRewards}</div>
                  </div>
                  <div>
                    <Link
                      to="/loyalty/rewards"
                      onClick={(e) => {
                        e.preventDefault()
                        setActiveTab("rewards")
                      }}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      <Gift className="h-4 w-4 mr-2" />
                      Đổi ưu đãi
                    </Link>
                  </div>
                </div>

                {nextTier && (
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Tiến độ lên hạng {nextTier.name}</span>
                      <span className="text-sm text-gray-500">
                        {userLoyalty.points}/{nextTier.pointsRequired} điểm
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                      ></div>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      Cần thêm {userLoyalty.pointsToNextTier} điểm để lên hạng {nextTier.name}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Recent activity */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold">Hoạt động gần đây</h2>
              </div>
              <div className="divide-y">
                {userLoyalty.history.slice(0, 3).map((item) => (
                  <div key={item.id} className="p-4 flex items-start">
                    <div
                      className={`rounded-full p-2 mr-4 ${
                        item.type === "earn" ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      {item.type === "earn" ? <Star className="h-5 w-5" /> : <Gift className="h-5 w-5" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <div className="font-medium">{item.description}</div>
                        <div className={item.type === "earn" ? "text-green-600" : "text-blue-600"}>
                          {item.type === "earn" ? "+" : ""}
                          {item.points} điểm
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">{formatDate(item.date)}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t">
                <button
                  onClick={() => setActiveTab("history")}
                  className="text-blue-600 text-sm font-medium hover:underline flex items-center"
                >
                  Xem tất cả hoạt động
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>

            {/* Benefits */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold">Quyền lợi của bạn</h2>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  {currentTier.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <div className="bg-blue-100 rounded-full p-1 mr-3">
                        <Award className="h-4 w-4 text-blue-600" />
                      </div>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-4 border-t">
                <button
                  onClick={() => setActiveTab("tiers")}
                  className="text-blue-600 text-sm font-medium hover:underline flex items-center"
                >
                  Xem tất cả hạng thành viên
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Rewards Tab */}
        {activeTab === "rewards" && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold">Đổi ưu đãi</h2>
                  <div className="text-sm font-medium">
                    Điểm hiện tại: <span className="text-blue-600">{userLoyalty.points}</span>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rewards.map((reward) => (
                    <div key={reward.id} className="border rounded-lg overflow-hidden">
                      <div
                        className={`p-4 ${
                          reward.category === "discount"
                            ? "bg-blue-50"
                            : reward.category === "food"
                              ? "bg-green-50"
                              : "bg-purple-50"
                        }`}
                      >
                        <div
                          className={`rounded-full w-10 h-10 flex items-center justify-center mb-2 ${
                            reward.category === "discount"
                              ? "bg-blue-100 text-blue-600"
                              : reward.category === "food"
                                ? "bg-green-100 text-green-600"
                                : "bg-purple-100 text-purple-600"
                          }`}
                        >
                          {reward.category === "discount" ? (
                            <Ticket className="h-5 w-5" />
                          ) : reward.category === "food" ? (
                            <Gift className="h-5 w-5" />
                          ) : (
                            <Gift className="h-5 w-5" />
                          )}
                        </div>
                        <h3 className="font-bold mb-1">{reward.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{reward.description}</p>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-1" />
                          Có hiệu lực trong {reward.expiryDays} ngày
                        </div>
                      </div>
                      <div className="p-4 bg-white flex justify-between items-center">
                        <div className="font-bold">{reward.points} điểm</div>
                        <button
                          onClick={() => handleRedeemReward(reward)}
                          disabled={userLoyalty.points < reward.points}
                          className={`px-3 py-1 rounded-md text-sm font-medium ${
                            userLoyalty.points >= reward.points
                              ? "bg-blue-600 text-white hover:bg-blue-700"
                              : "bg-gray-100 text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          Đổi ngay
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">Lịch sử điểm thưởng</h2>
            </div>
            <div className="divide-y">
              {userLoyalty.history.map((item) => (
                <div key={item.id} className="p-4 flex items-start">
                  <div
                    className={`rounded-full p-2 mr-4 ${
                      item.type === "earn" ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    {item.type === "earn" ? <Star className="h-5 w-5" /> : <Gift className="h-5 w-5" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div className="font-medium">{item.description}</div>
                      <div className={item.type === "earn" ? "text-green-600" : "text-blue-600"}>
                        {item.type === "earn" ? "+" : ""}
                        {item.points} điểm
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">{formatDate(item.date)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tiers Tab */}
        {activeTab === "tiers" && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold">Hạng thành viên</h2>
              </div>
              <div className="p-6">
                <div className="relative mb-8">
                  <div className="absolute h-1 bg-gray-200 top-4 left-0 right-0"></div>
                  <div className="flex justify-between relative">
                    {tiers.map((tier, index) => (
                      <div key={tier.id} className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                            tier.name === userLoyalty.tier
                              ? "bg-blue-600 text-white"
                              : index < tiers.findIndex((t) => t.name === userLoyalty.tier)
                                ? "bg-blue-600 text-white"
                                : "bg-gray-200 text-gray-500"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div className="mt-2 text-center">
                          <div className="font-medium">{tier.name}</div>
                          <div className="text-sm text-gray-500">{tier.pointsRequired} điểm</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  {tiers.map((tier) => (
                    <div
                      key={tier.id}
                      className={`border rounded-lg overflow-hidden ${
                        tier.name === userLoyalty.tier ? "border-blue-500 bg-blue-50" : ""
                      }`}
                    >
                      <div className="p-4 flex items-center justify-between border-b">
                        <div className="flex items-center">
                          <div className={`w-6 h-6 rounded-full ${tier.color} mr-3`}></div>
                          <h3 className="font-bold">Hạng {tier.name}</h3>
                        </div>
                        {tier.name === userLoyalty.tier && (
                          <div className="bg-blue-100 text-blue-600 text-xs font-medium px-2 py-1 rounded-full">
                            Hạng hiện tại
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <ul className="space-y-2">
                          {tier.benefits.map((benefit, index) => (
                            <li key={index} className="flex items-start">
                              <div className="bg-blue-100 rounded-full p-1 mr-2 mt-0.5">
                                <Award className="h-3 w-3 text-blue-600" />
                              </div>
                              <span className="text-sm">{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <Info className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-blue-800 mb-1">Làm thế nào để lên hạng?</h3>
                  <p className="text-sm text-blue-700">
                    Bạn sẽ được nâng hạng khi đạt đủ số điểm yêu cầu. Hạng thành viên của bạn sẽ được duy trì trong 12
                    tháng. Sau đó, hạng thành viên sẽ được đánh giá lại dựa trên số điểm tích lũy trong 12 tháng gần
                    nhất.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Redeem Modal */}
        {showRedeemModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              {redeemSuccess ? (
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                    <Award className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Đổi ưu đãi thành công!</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Bạn đã đổi thành công ưu đãi "{selectedReward.name}". Ưu đãi sẽ được gửi đến email của bạn.
                  </p>
                  <div className="bg-gray-50 p-4 rounded-md mb-4">
                    <div className="text-sm font-medium">Điểm còn lại</div>
                    <div className="text-2xl font-bold">{userLoyalty.points - selectedReward.points}</div>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Xác nhận đổi ưu đãi</h3>
                  <div className="bg-gray-50 p-4 rounded-md mb-4">
                    <div className="flex items-center mb-3">
                      <div
                        className={`rounded-full w-10 h-10 flex items-center justify-center mr-3 ${
                          selectedReward.category === "discount"
                            ? "bg-blue-100 text-blue-600"
                            : selectedReward.category === "food"
                              ? "bg-green-100 text-green-600"
                              : "bg-purple-100 text-purple-600"
                        }`}
                      >
                        {selectedReward.category === "discount" ? (
                          <Ticket className="h-5 w-5" />
                        ) : selectedReward.category === "food" ? (
                          <Gift className="h-5 w-5" />
                        ) : (
                          <Gift className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium">{selectedReward.name}</h4>
                        <p className="text-sm text-gray-500">{selectedReward.description}</p>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Điểm cần thiết:</span>
                      <span className="font-medium">{selectedReward.points} điểm</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Điểm hiện tại:</span>
                      <span className="font-medium">{userLoyalty.points} điểm</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Điểm còn lại:</span>
                      <span className="font-medium">{userLoyalty.points - selectedReward.points} điểm</span>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
                    <div className="flex">
                      <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0" />
                      <p className="text-sm text-yellow-700">
                        Ưu đãi sẽ có hiệu lực trong {selectedReward.expiryDays} ngày kể từ ngày đổi. Bạn sẽ nhận được
                        email xác nhận sau khi đổi ưu đãi.
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setShowRedeemModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={confirmRedemption}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Xác nhận đổi
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LoyaltyProgramPage;
