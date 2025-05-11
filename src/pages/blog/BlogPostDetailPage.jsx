import React from "react"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { motion } from "framer-motion"

const BlogPostDetailPage = () => {
  const { postId } = useParams()
  const [post, setPost] = useState(null)
  const [relatedPosts, setRelatedPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState({ name: "", email: "", content: "" })

  useEffect(() => {
    // Simulate fetching blog post from API
    setTimeout(() => {
      const mockPost = {
        id: Number.parseInt(postId),
        title: "Khám phá hương vị mới trong mùa thu này",
        content: `
          <p>Mùa thu đã đến, và nhà hàng chúng tôi vô cùng hào hứng giới thiệu đến quý khách hàng thực đơn mùa thu đặc biệt với nhiều món ăn hấp dẫn và độc đáo.</p>
          
          <h2>Nguồn cảm hứng</h2>
          <p>Lấy cảm hứng từ những nguyên liệu tươi ngon theo mùa, đội ngũ đầu bếp của chúng tôi đã sáng tạo nên những món ăn kết hợp giữa hương vị truyền thống và phong cách hiện đại.</p>
          
          <p>Một số món ăn nổi bật trong thực đơn mùa thu này bao gồm:</p>
          
          <ul>
            <li>Súp bí đỏ kem nấm truffle</li>
            <li>Salad củ cải đường với phô mai dê và hạt óc chó</li>
            <li>Cá hồi áp chảo với sốt cam thảo mộc</li>
            <li>Thăn bò Wagyu với sốt nấm rừng</li>
            <li>Bánh táo caramel với kem vanilla</li>
          </ul>
          
          <h2>Trải nghiệm ẩm thực</h2>
          <p>Mỗi món ăn không chỉ được chú trọng về hương vị mà còn được trình bày một cách nghệ thuật, mang đến trải nghiệm ẩm thực trọn vẹn cho thực khách.</p>
          
          <p>Ngoài ra, chúng tôi cũng giới thiệu danh sách rượu vang mới được tuyển chọn kỹ lưỡng để kết hợp hoàn hảo với các món ăn trong thực đơn mùa thu.</p>
          
          <h2>Đặt bàn ngay hôm nay</h2>
          <p>Thực đơn mùa thu sẽ được phục vụ từ ngày 15/9 đến 30/11. Để không bỏ lỡ cơ hội thưởng thức những món ăn đặc biệt này, quý khách vui lòng đặt bàn trước qua website hoặc số điện thoại của nhà hàng.</p>
          
          <p>Chúng tôi rất mong được đón tiếp và phục vụ quý khách!</p>
        `,
        image:
          "https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
        date: "2023-09-15",
        author: "Nguyễn Văn A",
        authorImage: "https://randomuser.me/api/portraits/men/32.jpg",
        authorBio: "Bếp trưởng với hơn 15 năm kinh nghiệm trong ngành ẩm thực. Chuyên về ẩm thực Á-Âu fusion.",
        category: "Thực đơn mới",
        tags: ["mùa thu", "món mới", "ẩm thực", "nhà hàng"],
        readTime: "5 phút",
      }

      const mockRelatedPosts = [
        {
          id: 2,
          title: "Bí quyết nấu ăn từ bếp trưởng của chúng tôi",
          excerpt: "Bếp trưởng Trần Văn B chia sẻ những bí quyết nấu ăn độc đáo giúp món ăn thêm hấp dẫn...",
          image:
            "https://images.unsplash.com/photo-1556910103-1c02745aae4d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
          date: "2023-09-10",
          category: "Mẹo nấu ăn",
        },
        {
          id: 3,
          title: "Sự kiện ẩm thực sắp tới tại nhà hàng",
          excerpt: "Đừng bỏ lỡ sự kiện ẩm thực đặc biệt vào cuối tháng này với nhiều hoạt động thú vị...",
          image:
            "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
          date: "2023-09-05",
          category: "Sự kiện",
        },
        {
          id: 4,
          title: "Nguồn gốc nguyên liệu tại nhà hàng chúng tôi",
          excerpt:
            "Tìm hiểu về cách chúng tôi lựa chọn nguyên liệu tươi ngon và hữu cơ từ các nhà cung cấp địa phương...",
          image:
            "https://images.unsplash.com/photo-1470549638415-0a0755be0619?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
          date: "2023-08-28",
          category: "Nguyên liệu",
        },
      ]

      const mockComments = [
        {
          id: 1,
          name: "Trần Thị Hương",
          date: "2023-09-16",
          content: "Tôi rất thích thực đơn mùa thu năm ngoái, mong chờ được thưởng thức những món mới năm nay!",
          replies: [
            {
              id: 2,
              name: "Nhà hàng ABC",
              date: "2023-09-16",
              content: "Cảm ơn bạn đã ủng hộ! Chúng tôi tin rằng bạn sẽ thích thực đơn mùa thu năm nay hơn nữa.",
              isAdmin: true,
            },
          ],
        },
        {
          id: 3,
          name: "Lê Minh Tuấn",
          date: "2023-09-17",
          content: "Món súp bí đỏ kem nấm truffle nghe rất hấp dẫn. Liệu có phiên bản chay không ạ?",
          replies: [],
        },
      ]

      setPost(mockPost)
      setRelatedPosts(mockRelatedPosts)
      setComments(mockComments)
      setLoading(false)
    }, 1000)
  }, [postId])

  const handleCommentChange = (e) => {
    const { name, value } = e.target
    setNewComment((prev) => ({ ...prev, [name]: value }))
  }

  const handleCommentSubmit = (e) => {
    e.preventDefault()
    const newCommentObj = {
      id: comments.length + 1,
      name: newComment.name,
      date: new Date().toISOString().split("T")[0],
      content: newComment.content,
      replies: [],
    }
    setComments((prev) => [...prev, newCommentObj])
    setNewComment({ name: "", email: "", content: "" })
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 ">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16  bg-red-50">
      {/* Breadcrumbs */}
      <nav className="flex mb-8 text-sm text-gray-500">
        <Link to="/" className="hover:text-blue-600 transition-colors">Trang chủ</Link>
        <span className="mx-2">/</span>
        <Link to="/blog" className="hover:text-blue-600 transition-colors">Blog</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">{post.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold text-gray-800 mb-4">{post.title}</h1>
            
            <div className="flex items-center mb-6">
              <img
                src={post.authorImage || "/placeholder.svg"}
                alt={post.author}
                className="w-10 h-10 rounded-full mr-4"
              />
              <div>
                <p className="font-medium text-gray-800">{post.author}</p>
                <div className="flex text-sm text-gray-500">
                  <span>{post.date}</span>
                  <span className="mx-2">•</span>
                  <span>{post.readTime}</span>
                </div>
              </div>
            </div>

            <img
              src={post.image || "/placeholder.svg"}
              alt={post.title}
              className="w-full h-auto rounded-xl mb-8"
            />

            <div 
              className="prose prose-lg max-w-none mb-12"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-12">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Author Bio */}
            <div className="bg-blue-50 rounded-xl p-6 mb-12">
              <div className="flex items-center">
                <img
                  src={post.authorImage || "/placeholder.svg"}
                  alt={post.author}
                  className="w-16 h-16 rounded-full mr-6"
                />
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Về tác giả</h3>
                  <p className="text-gray-700 mb-2">{post.author}</p>
                  <p className="text-gray-600">{post.authorBio}</p>
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Bình luận ({comments.length})</h3>
              
              {comments.map((comment) => (
                <div key={comment.id} className="mb-8">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex justify-between mb-4">
                      <div className="font-medium text-gray-800">{comment.name}</div>
                      <div className="text-sm text-gray-500">{comment.date}</div>
                    </div>
                    <p className="text-gray-700 mb-4">{comment.content}</p>
                    <button className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
                      Trả lời
                    </button>
                  </div>
                  
                  {/* Replies */}
                  {comment.replies.length > 0 && (
                    <div className="ml-12 mt-4">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="bg-white border border-gray-100 rounded-lg p-6 mb-4">
                          <div className="flex justify-between mb-4">
                            <div className="font-medium text-gray-800">
                              {reply.name}
                              {reply.isAdmin && (
                                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                  Nhà hàng
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">{reply.date}</div>
                          </div>
                          <p className="text-gray-700">{reply.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Comment Form */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-xl font-bold text-gray-800 mb-4">Để lại bình luận</h4>
                <form onSubmit={handleCommentSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Tên
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={newComment.name}
                        onChange={handleCommentChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={newComment.email}
                        onChange={handleCommentChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                      Bình luận
                    </label>
                    <textarea
                      id="content"
                      name="content"
                      value={newComment.content}
                      onChange={handleCommentChange}
                      rows="4"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Gửi bình luận
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Author Widget */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Về tác giả</h3>
            <div className="flex items-center mb-4">
              <img
                src={post.authorImage || "/placeholder.svg"}
                alt={post.author}
                className="w-12 h-12 rounded-full mr-4"
              />
              <div>
                <p className="font-medium text-gray-800">{post.author}</p>
                <p className="text-sm text-gray-500">Bếp trưởng</p>
              </div>
            </div>
            <p className="text-gray-600 mb-4">{post.authorBio}</p>
            <a
              href="#"
              className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              Xem tất cả bài viết
            </a>
          </div>

          {/* Categories Widget */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Danh mục</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="flex justify-between items-center text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <span>Thực đơn mới</span>
                  <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">8</span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex justify-between items-center text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <span>Mẹo nấu ăn</span>
                  <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">12</span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex justify-between items-center text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <span>Sự kiện</span>
                  <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">5</span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex justify-between items-center text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <span>Nguyên liệu</span>
                  <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">7</span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex justify-between items-center text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <span>Đồ uống</span>
                  <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">4</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Related Posts Widget */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Bài viết liên quan</h3>
            <div className="space-y-4">
              {relatedPosts.map((relatedPost) => (
                <div key={relatedPost.id} className="flex items-center">
                  <img
                    src={relatedPost.image || "/placeholder.svg"}
                    alt={relatedPost.title}
                    className="w-20 h-20 object-cover rounded-lg mr-4"
                  />
                  <div>
                    <Link
                      to={`/blog/${relatedPost.id}`}
                      className="font-medium text-gray-800 hover:text-blue-600 transition-colors line-clamp-2"
                    >
                      {relatedPost.title}
                    </Link>
                    <p className="text-sm text-gray-500 mt-1">{relatedPost.date}</p>
                  </div>
                </div>
                  ))}
            </div>
          </div>

          {/* Tags Widget */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <a
                  key={tag}
                  href="#"
                  className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-blue-100 hover:text-blue-700 transition-colors"
                >
                  #{tag}
                </a>
              ))}
              <a
                href="#"
                className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-blue-100 hover:text-blue-700 transition-colors"
              >
                #nhà_hàng
              </a>
              <a
                href="#"
                className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-blue-100 hover:text-blue-700 transition-colors"
              >
                #đầu_bếp
              </a>
              <a
                href="#"
                className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-blue-100 hover:text-blue-700 transition-colors"
              >
                #món_ngon
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BlogPostDetailPage
