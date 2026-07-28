import React from 'react';

export default function ShapeIcon({ shape, color = '#475569', size = 80 }) {
  const map = {
    circle: <div style={{ width: size, height: size, borderRadius: '50%', backgroundColor: color }} />,
    square: <div style={{ width: size, height: size, backgroundColor: color }} />,
    triangle: <div style={{ width: 0, height: 0, borderLeft: `${size / 2}px solid transparent`, borderRight: `${size / 2}px solid transparent`, borderBottom: `${size}px solid ${color}` }} />,
    star: <div style={{ fontSize: size, color, lineHeight: 1 }}>★</div>,
    diamond: <div style={{ width: size, height: size, backgroundColor: color, transform: 'rotate(45deg)' }} />,
    hexagon: <div style={{ fontSize: size, color, lineHeight: 1 }}>⬢</div>,
  };
  return <div className="flex items-center justify-center">{map[shape] || <div style={{ width: size, height: size, borderRadius: '50%', backgroundColor: color }} />}</div>;
}