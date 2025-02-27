import React, { useRef, useEffect } from 'react';
import styled from '@emotion/styled';

const FieldContainer = styled.div`
  position: absolute;
  pointer-events: auto;
`;

const Input = styled.input`
  width: 100%;
  height: 100%;
  border: 1px solid ${({ readOnly }) => (readOnly ? '#ccc' : '#3f51b5')};
  background: rgba(255, 255, 255, 0.9);
  padding: 4px;
  font-size: 12px;
  color: ${({ readOnly }) => (readOnly ? '#666' : '#000')};
  &:focus {
    outline: none;
    border-width: 2px;
  }
`;

const FormFieldOverlay = ({ field, scale, onChange }) => {
  const inputRef = useRef(null);

  // Handle focus on mount for better UX
  useEffect(() => {
    if (!field.readOnly && inputRef.current) {
      inputRef.current.focus();
    }
  }, [field.readOnly]);

  const style = {
    left: field.rect.x * scale,
    top: field.rect.y * scale,
    width: field.rect.width * scale,
    height: field.rect.height * scale
  };

  return (
    <FieldContainer style={style}>
      <Input
        ref={inputRef}
        value={field.value || ''}
        onChange={(e) => onChange(e.target.value)}
        readOnly={field.readOnly}
        required={field.required}
        placeholder={field.name}
        disabled={field.readOnly}
      />
    </FieldContainer>
  );
};

export default FormFieldOverlay;
