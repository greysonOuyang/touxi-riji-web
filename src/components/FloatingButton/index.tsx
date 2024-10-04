import React from 'react';
import { View, Text } from '@tarojs/components';
import { styled } from '@emotion/react';

const FloatingButton: React.FC = () => {
  const handleAddClick = () => {
    // 触发添加操作
  };

  return (
    <Container onClick={handleAddClick}>
      <PlusIcon>+</PlusIcon>
    </Container>
  );
};

export default FloatingButton;

const Container = styled(View)`
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #3a7ef6;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
  transition: transform 0.2s ease-in-out;

  &:active {
    transform: translateX(-50%) scale(1.1);
  }
`;

const PlusIcon = styled(Text)`
  font-size: 32px;
  font-weight: bold;
  color: #fff;
`;