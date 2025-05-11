import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"

const BlogPage = () => {
  const [posts, setPosts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => {
      const mockPosts = [
        {
          id: 1,
          title: "Khám phá hương vị mới trong mùa thu này",
          excerpt: "Nhà hàng chúng tôi vừa cập nhật thực đơn với các món ăn đặc biệt cho mùa thu...",
          image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
          date: "2023-09-15",
          author: "Nguyễn Văn A",
          category: "Thực đơn mới",
          readTime: "5 phút",
        },
        {
          id: 2,
          title: "Bí quyết nấu ăn từ bếp trưởng của chúng tôi",
          excerpt: "Bếp trưởng Trần Văn B chia sẻ những bí quyết nấu ăn độc đáo giúp món ăn thêm hấp dẫn...",
          image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
          date: "2023-09-10",
          author: "Trần Văn B",
          category: "Mẹo nấu ăn",
          readTime: "8 phút",
        },
        {
          id: 3,
          title: "Sự kiện ẩm thực sắp tới tại nhà hàng",
          excerpt: "Đừng bỏ lỡ sự kiện ẩm thực đặc biệt vào cuối tháng này với nhiều hoạt động thú vị...",
          image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
          date: "2023-09-05",
          author: "Lê Thị C",
          category: "Sự kiện",
          readTime: "4 phút",
        },
        {
          id: 4,
          title: "Nguồn gốc nguyên liệu tại nhà hàng chúng tôi",
          excerpt: "Tìm hiểu về cách chúng tôi lựa chọn nguyên liệu tươi ngon và hữu cơ từ các nhà cung cấp địa phương...",
          image: "https://images.unsplash.com/photo-1470549638415-0a0755be0619?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
          date: "2023-08-28",
          author: "Phạm Văn D",
          category: "Nguyên liệu",
          readTime: "6 phút",
        },
        {
          id: 5,
          title: "Cách thưởng thức rượu vang đúng cách",
          excerpt: "Hướng dẫn chi tiết về cách chọn và thưởng thức rượu vang phù hợp với từng món ăn...",
          image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
          date: "2023-08-20",
          author: "Hoàng Thị E",
          category: "Đồ uống",
          readTime: "7 phút",
        },
      ]

      const uniqueCategories = [...new Set(mockPosts.map((post) => post.category))]
      setPosts(mockPosts)
      setCategories(uniqueCategories)
      setLoading(false)
    }, 1000)
  }, [])

  const filteredPosts = selectedCategory === "all"
    ? posts
    : posts.filter(post => post.category === selectedCategory)

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex justify-center items-center h-64 sm:h-80">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16  bg-red-50">
      <div className="text-center mb-16">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">Blog Ẩm Thực</h1>
        <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
          Khám phá những bài viết thú vị về ẩm thực, mẹo nấu ăn, và tin tức mới nhất từ nhà hàng chúng tôi.
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-3 mb-12">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === "all"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-800 hover:bg-gray-200"
          }`}
        >
          Tất cả
        </button>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Blog Posts */}
      <div className="grid grid-cols-2 gap-6 sm:gap-8">
        {filteredPosts.map((post) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl overflow-hidden shadow hover:shadow-xl transition-shadow duration-300"
          >
            <Link to={`/blog/${post.id}`}>
              <img
                src={post.image || "/placeholder.svg"}
                alt={post.title}
                className="w-full h-40 sm:h-52 md:h-64 object-cover rounded-t-2xl hover:scale-105 transition-transform duration-300"
              />
            </Link>
            <div className="p-5 sm:p-6">
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <span>{post.date}</span>
                <span className="mx-2">•</span>
                <span>{post.readTime}</span>
              </div>
              <Link to={`/blog/${post.id}`}>
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 hover:text-blue-600 transition-colors">
                  {post.title}
                </h2>
              </Link>
              <p className="text-gray-600 mb-4 text-sm sm:text-base">{post.excerpt}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-600">{post.category}</span>
                <Link
                  to={`/blog/${post.id}`}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Đọc tiếp →
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Newsletter Subscription */}
      <div className="mt-20 bg-blue-50 rounded-xl px-6 py-10 sm:px-10 sm:py-12 md:py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Đăng ký nhận bản tin</h3>
          <p className="text-gray-600 mb-6">
            Nhận thông báo về các bài viết mới và ưu đãi đặc biệt từ nhà hàng chúng tôi.
          </p>
          <form className="flex flex-col sm:flex-row gap-4 sm:gap-2 px-2">
            <input
              type="email"
              placeholder="Địa chỉ email của bạn"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Đăng ký
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default BlogPage
