import { ConfigProvider } from "antd";
import viVN from "antd/locale/vi_VN";
import { AuthProvider } from "./context/AuthContext";
import AppRouter from "./routes/AppRouter";

function App() {
  return (
    <ConfigProvider
      locale={viVN}
      theme={{
        token: {
          colorPrimary: "#1890ff",
          borderRadius: 6,
        },
      }}
    >
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;
