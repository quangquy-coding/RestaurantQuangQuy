import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Mail, ArrowLeft, Key, RefreshCw } from "lucide-react";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [method, setMethod] = useState("code");
  const [step, setStep] = useState(1);
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmitEmail = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Vui lòng nhập địa chỉ email");
      return;
    }

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      if (method === "code") {
        toast.success("Mã xác nhận đã được gửi đến email của bạn");
        setStep(2);
      } else {
        toast.success("Liên kết đặt lại mật khẩu đã được gửi đến email của bạn");
        setStep(3);
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra. Vui lòng thử lại sau");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!verificationCode) {
      toast.error("Vui lòng nhập mã xác nhận");
      return;
    }

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success("Mã xác nhận hợp lệ");
      setStep(4);
    } catch (error) {
      toast.error("Mã xác nhận không hợp lệ");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword) {
      toast.error("Vui lòng nhập mật khẩu mới");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success("Đặt lại mật khẩu thành công");
      setStep(5);
    } catch (error) {
      toast.error("Có lỗi xảy ra. Vui lòng thử lại sau");
    } finally {
      setLoading(false);
    }
  };

  const renderEmailForm = () => (
    <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8">
      <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">Quên mật khẩu</h2>
      <form onSubmit={handleSubmitEmail}>
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">Email</label>
          <div className="relative">
            <Mail className="absolute inset-y-0 left-3 my-auto text-gray-400" />
            <input
              type="email"
              className="pl-10 w-full py-2 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập địa chỉ email của bạn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-2">Chọn phương thức khôi phục:</p>
          <div className="flex flex-col space-y-3">
            <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="recoveryMethod"
                checked={method === "code"}
                onChange={() => setMethod("code")}
                className="h-4 w-4 text-blue-600"
              />
              <div className="ml-3">
                <span className="block text-sm">Gửi mã xác nhận</span>
                <span className="block text-xs text-gray-500">Nhận mã xác nhận qua email và đặt lại mật khẩu</span>
              </div>
            </label>
            <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="recoveryMethod"
                checked={method === "link"}
                onChange={() => setMethod("link")}
                className="h-4 w-4 text-blue-600"
              />
              <div className="ml-3">
                <span className="block text-sm">Gửi liên kết đặt lại</span>
                <span className="block text-xs text-gray-500">Nhận liên kết đặt lại mật khẩu qua email</span>
              </div>
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <RefreshCw className="animate-spin -ml-1 mr-2 h-4 w-4" />
              Đang xử lý...
            </span>
          ) : (
            "Tiếp tục"
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link to="/login" className="text-sm text-blue-600 hover:text-blue-800">
          <ArrowLeft className="h-4 w-4 inline-block mr-1" />
          Quay lại đăng nhập
        </Link>
      </div>
    </div>
  );

  const renderVerificationForm = () => (
    <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8">
      <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">Xác nhận mã</h2>
      <form onSubmit={handleVerifyCode}>
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">Mã xác nhận</label>
          <div className="relative">
            <Key className="absolute inset-y-0 left-3 my-auto text-gray-400" />
            <input
              type="text"
              className="pl-10 w-full py-2 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập mã xác nhận từ email"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              required
            />
          </div>
          <p className="mt-2 text-sm text-gray-500">Mã xác nhận đã được gửi đến {email}</p>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <RefreshCw className="animate-spin -ml-1 mr-2 h-4 w-4" />
              Đang xác nhận...
            </span>
          ) : (
            "Xác nhận"
          )}
        </button>

        <div className="mt-4">
          <button
            type="button"
            className="w-full text-blue-600 py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors"
            onClick={() => setStep(1)}
          >
            Quay lại
          </button>
        </div>
      </form>
    </div>
  );

  const renderNewPasswordForm = () => (
    <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8">
      <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">Đặt lại mật khẩu</h2>
      <form onSubmit={handleResetPassword}>
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Mật khẩu mới</label>
          <input
            type="password"
            className="w-full py-2 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập mật khẩu mới"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">Xác nhận mật khẩu</label>
          <input
            type="password"
            className="w-full py-2 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập lại mật khẩu mới"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <RefreshCw className="animate-spin -ml-1 mr-2 h-4 w-4" />
              Đang xử lý...
            </span>
          ) : (
            "Đặt lại mật khẩu"
          )}
        </button>
      </form>
    </div>
  );

  const renderLinkSentSuccess = () => (
    <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8 text-center">
      <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
        <Mail className="h-8 w-8 text-green-600" />
      </div>
      <h2 className="text-3xl font-bold text-green-600 mb-2">Kiểm tra email của bạn</h2>
      <p className="text-gray-600 mb-6">
        Chúng tôi đã gửi một liên kết đặt lại mật khẩu đến {email}. Vui lòng kiểm tra hộp thư đến của bạn và làm theo hướng dẫn.
      </p>
      <Link
        to="/login"
        className="block w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Quay lại đăng nhập
      </Link>
    </div>
  );

  const renderResetSuccess = () => (
    <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8 text-center">
      <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
        <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="text-3xl font-bold text-green-600 mb-2">Mật khẩu đã được đặt lại</h2>
      <p className="text-gray-600 mb-6">
        Mật khẩu của bạn đã được đặt lại thành công. Bây giờ bạn có thể đăng nhập bằng mật khẩu mới.
      </p>
      <Link
        to="/login"
        className="block w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Đăng nhập
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      {step === 1 && renderEmailForm()}
      {step === 2 && renderVerificationForm()}
      {step === 3 && renderLinkSentSuccess()}
      {step === 4 && renderNewPasswordForm()}
      {step === 5 && renderResetSuccess()}
    </div>
  );
};

export default ForgotPasswordPage;
