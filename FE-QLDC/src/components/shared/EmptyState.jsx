import { Empty, Button } from "antd";

const EmptyState = ({
  description = "Không có dữ liệu",
  buttonText,
  onButtonClick,
  icon,
}) => {
  return (
    <div style={{ padding: "40px 0", textAlign: "center" }}>
      <Empty
        image={icon || Empty.PRESENTED_IMAGE_SIMPLE}
        description={description}
      >
        {buttonText && (
          <Button type="primary" onClick={onButtonClick}>
            {buttonText}
          </Button>
        )}
      </Empty>
    </div>
  );
};

export default EmptyState;

