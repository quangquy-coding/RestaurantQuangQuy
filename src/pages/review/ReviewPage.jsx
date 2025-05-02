import React from "react"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Star, Search, Filter, ChevronDown, MessageSquare, ThumbsUp, ThumbsDown } from "lucide-react"

// Mock data for reviews
const mockReviews = [
  {
    id: 1,
    orderId: "23456",
    customerName: "Trần Thị B",
    customerAvatar: "/placeholder.svg?height=40&width=40",
    rating: 4.5,
    comment: "Món ăn ngon, phục vụ nhanh. Sẽ quay lại lần sau.",
    createdAt: "2023-05-14T20:30:00",
    items: ["Cơm rang hải sản", "Bánh xèo", "Nước ép cam"],
    likes: 12,
    dislikes: 2,
    reply: {
      content:
        "Cảm ơn quý khách đã đánh giá. Chúng tôi rất vui khi quý khách hài lòng với dịch vụ của nhà hàng. Hẹn gặp lại quý khách trong thời gian sớm nhất!",
      createdAt: "2023-05-15T10:15:00",
    },
  },
  {
    id: 2,
    orderId: "34567",
    customerName: "Lê Văn C",
    customerAvatar: "/placeholder.svg?height=40&width=40",
    rating: 5,
    comment:
      "Đồ ăn tuyệt vời, không gian đẹp, nhân viên thân thiện. Tôi đặc biệt thích món Phở bò, nước dùng rất ngọt và thơm.",
    createdAt: "2023-05-10T19:45:00",
    items: ["Phở bò tái", "Gỏi cuốn tôm thịt", "Cà phê sữa đá"],
    likes: 24,
    dislikes: 0,
    reply: null,
  },
  {
    id: 3,
    orderId: "45678",
    customerName: "Phạm Thị D",
    customerAvatar: "/placeholder.svg?height=40&width=40",
    rating: 3,
    comment: "Đồ ăn ngon nhưng phục vụ hơi chậm. Tôi đã phải đợi gần 30 phút mới nhận được món.",
    createdAt: "2023-05-08T12:30:00",
    items: ["Bún chả Hà Nội", "Nước ép cam"],
    likes: 5,
    dislikes: 3,
    reply: {
      content:
        "Chúng tôi xin lỗi vì sự chậm trễ trong dịch vụ. Chúng tôi đang cải thiện quy trình để phục vụ khách hàng nhanh hơn. Mong quý khách thông cảm và tiếp tục ủng hộ nhà hàng.",
      createdAt: "2023-05-08T14:20:00",
    },
  },
  {
    id: 4,
    orderId: "56789",
    customerName: "Hoàng Văn E",
    customerAvatar: "/placeholder.svg?height=40&width=40",
    rating: 4,
    comment: "Món ăn ngon, giá cả hợp lý. Không gian hơi ồn ào vào giờ cao điểm.",
    createdAt: "2023-05-05T18:15:00",
    items: ["Cơm rang hải sản", "Chè đậu đen"],
    likes: 8,
    dislikes: 1,
    reply: null,
  },
  {
    id: 5,
    orderId: "67890",
    customerName: "Ngô Thị F",
    customerAvatar: "/placeholder.svg?height=40&width=40",
    rating: 2,
    comment: "Thất vọng với chất lượng món ăn. Bánh xèo bị cháy, nước mắm quá mặn.",
    createdAt: "2023-05-03T20:00:00",
    items: ["Bánh xèo", "Gỏi cuốn tôm thịt"],
    likes: 2,
    dislikes: 7,
    reply: {
      content:
        "Chúng tôi rất tiếc về trải nghiệm không tốt của quý khách. Chúng tôi đã ghi nhận phản hồi và sẽ cải thiện chất lượng món ăn. Mong quý khách cho chúng tôi cơ hội được phục vụ tốt hơn trong lần tới.",
      createdAt: "2023-05-04T09:30:00",
    },
  },
]

const ReviewPage = () => {
  const [reviews, setReviews] = useState([])
  const [filteredReviews, setFilteredReviews] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [ratingFilter, setRatingFilter] = useState("Tất cả")
  const [sortOption, setSortOption] = useState("newest")
  const [replyText, setReplyText] = useState("")
  const [replyingTo, setReplyingTo] = useState(null)

  useEffect(() => {
    // In a real app, you would fetch reviews from an API
    setReviews(mockReviews)
    setFilteredReviews(mockReviews)
  }, [])

  useEffect(() => {
    // Filter and sort reviews
    let filtered = [...reviews]

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (review) =>
          review.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          review.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
          review.items.some((item) => item.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // Filter by rating
    if (ratingFilter !== "Tất cả") {
      const rating = Number.parseInt(ratingFilter.split(" ")[0])
      filtered = filtered.filter((review) => Math.floor(review.rating) === rating)
    }

    // Sort reviews
    switch (sortOption) {
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        break
      case "oldest":
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        break
      case "highest":
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case "lowest":
        filtered.sort((a, b) => a.rating - b.rating)
        break
      case "most-liked":
        filtered.sort((a, b) => b.likes - a.likes)
        break
      default:
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    }

    setFilteredReviews(filtered)
  }, [reviews, searchTerm, ratingFilter, sortOption])

  const handleReply = (reviewId) => {
    if (!replyText.trim()) return

    // In a real app, you would send the reply to an API
    // For now, we'll just update the local state
    const updatedReviews = reviews.map((review) => {
      if (review.id === reviewId) {
        return {
          ...review,
          reply: {
            content: replyText,
            createdAt: new Date().toISOString(),
          },
        }
      }
      return review
    })

    setReviews(updatedReviews)
    setReplyText("")
    setReplyingTo(null)
  }

  const handleLike = (reviewId) => {
    const updatedReviews = reviews.map((review) => {
      if (review.id === reviewId) {
        return {
          ...review,
          likes: review.likes + 1,
        }
      }
      return review
    })

    setReviews(updatedReviews)
  }

  const handleDislike = (reviewId) => {
    const updatedReviews = reviews.map((review) => {
      if (review.id === reviewId) {
        return {
          ...review,
          dislikes: review.dislikes + 1,
        }
      }
      return review
    })

    setReviews(updatedReviews)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Đánh giá từ khách hàng</h1>

        {/* Search and filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Tìm kiếm đánh giá..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative">
                <select
                  value={ratingFilter}
                  onChange={(e) => setRatingFilter(e.target.value)}
                  className="appearance-none pl-10 pr-8 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Tất cả">Tất cả đánh giá</option>
                  <option value="5 sao">5 sao</option>
                  <option value="4 sao">4 sao</option>
                  <option value="3 sao">3 sao</option>
                  <option value="2 sao">2 sao</option>
                  <option value="1 sao">1 sao</option>
                </select>
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              </div>

              <div className="relative">
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="appearance-none pl-10 pr-8 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="oldest">Cũ nhất</option>
                  <option value="highest">Đánh giá cao nhất</option>
                  <option value="lowest">Đánh giá thấp nhất</option>
                  <option value="most-liked">Nhiều lượt thích nhất</option>
                </select>
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="space-y-6">
          {filteredReviews.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-500 mb-4">Không tìm thấy đánh giá nào phù hợp</p>
              <button
                onClick={() => {
                  setSearchTerm("")
                  setRatingFilter("Tất cả")
                  setSortOption("newest")
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Xóa bộ lọc
              </button>
            </div>
          ) : (
            filteredReviews.map((review) => (
              <div key={review.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start">
                    <img
                      src={review.customerAvatar || "/placeholder.svg"}
                      alt={review.customerName}
                      className="h-10 w-10 rounded-full mr-4"
                    />
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                        <div>
                          <h3 className="font-medium">{review.customerName}</h3>
                          <div className="flex items-center">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-4 w-4 ${
                                    star <= review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="ml-2 text-sm text-gray-500">{formatDate(review.createdAt)}</span>
                          </div>
                        </div>
                        <Link
                          to={`/order-detail/${review.orderId}`}
                          className="text-sm text-blue-600 hover:underline mt-1 sm:mt-0"
                        >
                          Xem đơn hàng
                        </Link>
                      </div>

                      <p className="text-gray-700 mb-3">{review.comment}</p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {review.items.map((item, index) => (
                          <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                            {item}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => handleLike(review.id)}
                          className="flex items-center text-gray-500 hover:text-blue-600"
                        >
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          <span>{review.likes}</span>
                        </button>
                        <button
                          onClick={() => handleDislike(review.id)}
                          className="flex items-center text-gray-500 hover:text-red-600"
                        >
                          <ThumbsDown className="h-4 w-4 mr-1" />
                          <span>{review.dislikes}</span>
                        </button>
                        <button
                          onClick={() => setReplyingTo(replyingTo === review.id ? null : review.id)}
                          className="flex items-center text-gray-500 hover:text-blue-600"
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          <span>Trả lời</span>
                        </button>
                      </div>

                      {/* Reply section */}
                      {review.reply && (
                        <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-start">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                              <MessageSquare className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <div className="flex items-center">
                                <h4 className="font-medium text-sm">Phản hồi từ nhà hàng</h4>
                                <span className="ml-2 text-xs text-gray-500">{formatDate(review.reply.createdAt)}</span>
                              </div>
                              <p className="text-gray-700 text-sm mt-1">{review.reply.content}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Reply form */}
                      {replyingTo === review.id && !review.reply && (
                        <div className="mt-4">
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Nhập phản hồi của bạn..."
                            rows="3"
                            className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                          ></textarea>
                          <div className="flex justify-end mt-2 space-x-2">
                            <button
                              onClick={() => setReplyingTo(null)}
                              className="px-3 py-1 border rounded-md text-gray-700 hover:bg-gray-50"
                            >
                              Hủy
                            </button>
                            <button
                              onClick={() => handleReply(review.id)}
                              className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                              Gửi phản hồi
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default ReviewPage
