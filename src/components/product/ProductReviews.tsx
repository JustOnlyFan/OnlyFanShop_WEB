'use client'

import { useState, useEffect } from 'react'
import { ReviewService, ProductReview, CreateReviewRequest } from '@/services/reviewService'
import { Star, User, Calendar, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

interface ProductReviewsProps {
  productId: number
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<ProductReview[]>([])
  const [loading, setLoading] = useState(true)
  const [averageRating, setAverageRating] = useState(0)
  const [ratingDistribution, setRatingDistribution] = useState({
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  })
  const [totalReviews, setTotalReviews] = useState(0)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [userReview, setUserReview] = useState<ProductReview | null>(null)
  const [submitting, setSubmitting] = useState(false)
  
  const { user, isAuthenticated } = useAuthStore()
  
  const [formData, setFormData] = useState<CreateReviewRequest>({
    productId,
    rating: 5,
    title: '',
    content: '',
    images: [],
  })

  useEffect(() => {
    loadReviews()
    if (isAuthenticated) {
      loadUserReview()
    }
  }, [productId, isAuthenticated])

  const loadReviews = async () => {
    try {
      setLoading(true)
      const response = await ReviewService.getProductReviews(productId, 0, 50)
      if (response.data) {
        setReviews(response.data.reviews || [])
        setAverageRating(response.data.averageRating || 0)
        setRatingDistribution(response.data.ratingDistribution || {
          5: 0, 4: 0, 3: 0, 2: 0, 1: 0,
        })
        setTotalReviews(response.data.totalElements || 0)
      }
    } catch (error: any) {
      console.error('Error loading reviews:', error)
      // If API doesn't exist yet, show empty state
      setReviews([])
      setAverageRating(0)
      setTotalReviews(0)
    } finally {
      setLoading(false)
    }
  }

  const loadUserReview = async () => {
    try {
      const response = await ReviewService.getUserReview(productId)
      if (response.data) {
        setUserReview(response.data)
        if (response.data) {
          setFormData({
            productId,
            rating: response.data.rating,
            title: response.data.title || '',
            content: response.data.content || '',
            images: ReviewService.parseReviewImages(response.data.imagesJson),
          })
        }
      }
    } catch (error) {
      // User hasn't reviewed yet
      setUserReview(null)
    }
  }

  const handleSubmitReview = async () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để đánh giá sản phẩm')
      return
    }

    if (!formData.rating) {
      toast.error('Vui lòng chọn số sao đánh giá')
      return
    }

    if (!formData.content?.trim()) {
      toast.error('Vui lòng nhập nội dung đánh giá')
      return
    }

    try {
      setSubmitting(true)
      if (userReview) {
        await ReviewService.updateReview(userReview.id, formData)
        toast.success('Cập nhật đánh giá thành công!')
      } else {
        await ReviewService.createReview(formData)
        toast.success('Gửi đánh giá thành công! Đánh giá của bạn đang chờ duyệt.')
      }
      setShowReviewForm(false)
      loadReviews()
      loadUserReview()
    } catch (error: any) {
      toast.error(error.message || 'Không thể gửi đánh giá')
    } finally {
      setSubmitting(false)
    }
  }

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
    }

    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`${sizeClasses[size]} ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  const getRatingPercentage = (rating: number) => {
    if (totalReviews === 0) return 0
    return (ratingDistribution[rating as keyof typeof ratingDistribution] / totalReviews) * 100
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Rating Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Average Rating */}
          <div className="text-center">
            <div className="text-5xl font-bold text-blue-600 mb-2">
              {averageRating.toFixed(1)}
            </div>
            <div className="flex items-center justify-center gap-1 mb-2">
              {renderStars(Math.round(averageRating), 'lg')}
            </div>
            <div className="text-sm text-gray-600">
              {totalReviews} {totalReviews === 1 ? 'đánh giá' : 'đánh giá'}
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="col-span-2 space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-20">
                  <span className="text-sm font-medium">{rating}</span>
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                </div>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-yellow-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${getRatingPercentage(rating)}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">
                  {ratingDistribution[rating as keyof typeof ratingDistribution]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Write Review Button */}
      {isAuthenticated && (
        <div>
          {userReview ? (
            <Button
              onClick={() => setShowReviewForm(true)}
              variant="outline"
              className="w-full md:w-auto"
            >
              Sửa đánh giá của tôi
            </Button>
          ) : (
            <Button
              onClick={() => setShowReviewForm(true)}
              className="w-full md:w-auto bg-blue-600 hover:bg-blue-700"
            >
              Viết đánh giá
            </Button>
          )}
        </div>
      )}

      {/* Review Form */}
      <AnimatePresence>
        {showReviewForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white border border-gray-200 rounded-xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {userReview ? 'Sửa đánh giá' : 'Viết đánh giá'}
              </h3>
              <button
                onClick={() => setShowReviewForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Đánh giá của bạn *
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setFormData({ ...formData, rating })}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        rating <= formData.rating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      } transition-colors`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiêu đề (tùy chọn)
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập tiêu đề đánh giá"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nội dung đánh giá *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowReviewForm(false)}
                disabled={submitting}
              >
                Hủy
              </Button>
              <Button
                onClick={handleSubmitReview}
                disabled={submitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Chưa có đánh giá nào</p>
            <p className="text-gray-400 text-sm mt-2">
              Hãy là người đầu tiên đánh giá sản phẩm này!
            </p>
          </div>
        ) : (
          reviews.map((review) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-gray-200 rounded-xl p-6 space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {review.user?.username || 'Người dùng'}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      {ReviewService.formatReviewDate(review.createdAt)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {renderStars(review.rating)}
                </div>
              </div>

              {review.title && (
                <h4 className="font-semibold text-gray-900">{review.title}</h4>
              )}

              {review.content && (
                <p className="text-gray-700 leading-relaxed">{review.content}</p>
              )}

              {review.images && review.images.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {review.images.map((image, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-lg overflow-hidden bg-gray-100"
                    >
                      <img
                        src={image}
                        alt={`Review image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}












