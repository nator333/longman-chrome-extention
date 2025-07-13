import React from 'react';
import { CSS_CLASSES } from '../constants';

interface DictionaryIconProps {
  onClick: (event: React.MouseEvent) => void;
  style: React.CSSProperties;
}

const DictionaryIcon: React.FC<DictionaryIconProps> = ({ onClick, style }) => {
  return (
    <div 
      className={CSS_CLASSES.LMD_ICON} 
      style={style} 
      onClick={onClick}
    >
      <div className={CSS_CLASSES.LMD_ICON_IMG} />
    </div>
  );
};

export default DictionaryIcon;
