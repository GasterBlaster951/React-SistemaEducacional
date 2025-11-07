import React from 'react'

export default function Loader({ size = 24 }: { size?: number }) {
  const style: React.CSSProperties = { width: size, height: size, borderRadius: '50%', border: '3px solid #ccc', borderTopColor: '#4f46e5', animation: 'spin 1s linear infinite' }
  return <div style={style} aria-label="Carregando" />
}
