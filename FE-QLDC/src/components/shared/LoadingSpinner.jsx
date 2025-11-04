import { Spin } from "antd";

const LoadingSpinner = ({ tip = "Đang tải...", size = "large" }) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "400px",
      }}
    >
      <Spin size={size} tip={tip} />
    </div>
  );
};

export default LoadingSpinner;
