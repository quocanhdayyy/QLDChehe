import { useState, useCallback } from "react";
import { message } from "antd";
import {
  SafetyOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
// ✅ Constants được định nghĩa ngay trong file
const ROLES = {
  LEADER: 'TO_TRUONG',
  CITIZEN: 'CONG_DAN'
};
const ROUTES = {
  LEADER_DASHBOARD: '/leader/dashboard',
  CITIZEN_DASHBOARD: '/citizen/dashboard'
};
const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();
  const handleLogin = useCallback(async (identifier, password) => {
    setLoading(true);
    try {
      const user = await login({ identifier, password });
      message.success("Đăng nhập thành công!");
      
      // ✅ Sử dụng constants thay vì hardcode
      const isLeader = user.role === ROLES.LEADER;
      navigate(isLeader ? ROUTES.LEADER_DASHBOARD : ROUTES.CITIZEN_DASHBOARD);
      
    } catch (error) {
      console.error("Login error:", error);
      const errorMsg = error.message || "Tài khoản hoặc mật khẩu không đúng";
      message.error(errorMsg);
      return errorMsg;
    } finally {
      setLoading(false);
    }
  }, [login, navigate]);
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!identifier || !password) {
      setError("Vui lòng nhập tài khoản và mật khẩu");
      return;
    }
    
    const errorMsg = await handleLogin(identifier, password);
    if (errorMsg) {
      setError(errorMsg);
    }
  };
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Left Side */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full h-full flex items-center justify-center">
          <img 
            src="/images/Screenshot 2025-10-29 222421.jpg"
            //src="/images/JgFurWn6QrGE-OZqMmsv_w.jpg"
            //src="/images/Screenshot 2025-10-31 173105.jpg"
            //src="/images/Screenshot 2025-10-29 204740.jpg"
            alt="Hệ thống quản lý dân cư"
            className="w-full h-full object-cover rounded-2xl shadow-lg" 
          />
        </div>
      </div>
      {/* Login Form Section */}
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="w-full max-w-lg p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              
                  <SafetyOutlined className="text-5xl" style={{ color: "#1890ff" }} />

            </div>
            <h2 className="text-3xl font-bold text-gray-900">Đăng nhập hệ thống</h2>
            <p className="text-gray-600 mt-2">Hệ thống quản lý dân cư & khen thưởng</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-base font-medium text-gray-700 mb-3">
                Tên đăng nhập
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full px-5 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                placeholder="Nhập tên đăng nhập"
                autoComplete="username"
              />
            </div>
            
            <div>
              <label className="block text-base font-medium text-gray-700 mb-3">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 pr-12"
                  placeholder="Nhập mật khẩu"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 transition duration-200"
                >
                  {showPassword ? (
                    <EyeOutlined className="text-xl" />
                  ) : (
                    <EyeInvisibleOutlined className="text-xl" />
                  )}
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="ml-3 text-base text-gray-600">Ghi nhớ đăng nhập</span>
              </label>
              <a href="#" className="text-base text-blue-600 hover:text-blue-800">
                Quên mật khẩu?
              </a>
            </div>
            
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="text-red-600 text-base text-center">
                  {error}
                </div>
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-4 px-5 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>
          
          <div className="mt-8 text-center text-base text-gray-500">
            Hỗ trợ: Ban quản lý - 0900.xxx.xxx
          </div>
        </div>
      </div>
    </div>
  );
};
export default LoginPage;