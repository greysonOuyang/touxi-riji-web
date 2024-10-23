import { View } from '@tarojs/components';
import './index.scss';

const AddButton = ({ size = 32, onClick, className = '', style = {} }) => {
  return (
    <View
      className={`add-button ${className}`}
      style={{ width: `${size}px`, height: `${size}px`, ...style }}
      onClick={onClick}
    >
      <View className="plus-icon" />
    </View>
  );
};

export default AddButton;
