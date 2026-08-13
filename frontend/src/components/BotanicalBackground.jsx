// src/components/BotanicalBackground.jsx
import React from 'react';

export default function BotanicalBackground() {
  return (
    <div className="botanical-bg-overlay" aria-hidden="true">
      {/* Top Right Organic Leaf Art */}
      <div className="botanical-art top-right-art">
        <svg viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg" className="botanical-svg">
          {/* Organic background blob */}
          <path 
            d="M380 90C430 140 480 210 460 280C440 350 350 420 280 440C210 460 160 430 110 380C60 330 30 250 50 180C70 110 140 50 220 40C300 30 330 40 380 90Z" 
            className="blob-bg-path" 
          />
          {/* Monstera & Foliage Line Art */}
          <path 
            d="M260 420C260 420 280 320 320 240C360 160 430 110 430 110" 
            className="leaf-stem" 
            strokeWidth="3.5" 
            strokeLinecap="round" 
          />
          {/* Main Leaf 1 Outline & Details */}
          <path 
            d="M430 110C390 120 350 150 320 190C290 230 270 280 260 340C310 330 360 300 400 250C440 200 450 150 430 110Z" 
            className="leaf-outline" 
            strokeWidth="2.5" 
          />
          <path d="M375 165C350 185 330 210 315 240" className="leaf-vein" strokeWidth="2" />
          <path d="M400 205C370 225 345 255 330 290" className="leaf-vein" strokeWidth="2" />
          <path d="M340 140C330 165 320 190 310 220" className="leaf-vein" strokeWidth="2" />

          {/* Secondary Delicate Leaf Frond */}
          <path 
            d="M180 360C220 310 270 250 330 180C390 110 410 70 410 70" 
            className="leaf-stem-secondary" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
          />
          {/* Individual frond leaflets */}
          <path d="M410 70C380 75 360 90 350 110C370 105 390 95 410 70Z" className="leaf-leaflet" strokeWidth="1.8" />
          <path d="M380 105C350 115 330 135 320 155C340 145 365 130 380 105Z" className="leaf-leaflet" strokeWidth="1.8" />
          <path d="M345 145C315 160 295 180 285 205C305 190 330 175 345 145Z" className="leaf-leaflet" strokeWidth="1.8" />
          <path d="M305 190C275 210 255 235 245 260C265 240 290 220 305 190Z" className="leaf-leaflet" strokeWidth="1.8" />
          
          <path d="M395 90C415 115 425 140 420 165C410 140 395 115 395 90Z" className="leaf-leaflet" strokeWidth="1.8" />
          <path d="M360 130C385 155 395 180 390 205C378 180 360 155 360 130Z" className="leaf-leaflet" strokeWidth="1.8" />
          <path d="M320 175C345 200 355 225 350 250C338 225 320 200 320 175Z" className="leaf-leaflet" strokeWidth="1.8" />
        </svg>
      </div>

      {/* Bottom Left Botanical Leaf Accent */}
      <div className="botanical-art bottom-left-art">
        <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="botanical-svg">
          <path 
            d="M80 320C50 260 40 180 90 120C140 60 220 40 280 80C340 120 360 200 320 270C280 340 180 370 120 350C95 340 85 330 80 320Z" 
            className="blob-bg-path" 
          />
          <path 
            d="M70 340C120 280 180 200 240 120C270 80 300 50 300 50" 
            className="leaf-stem" 
            strokeWidth="3" 
            strokeLinecap="round" 
          />
          <path d="M300 50C265 65 240 90 230 115C255 105 280 85 300 50Z" className="leaf-leaflet" strokeWidth="2" />
          <path d="M260 95C225 115 200 145 190 175C215 160 240 135 260 95Z" className="leaf-leaflet" strokeWidth="2" />
          <path d="M210 150C175 175 150 205 140 235C165 215 190 190 210 150Z" className="leaf-leaflet" strokeWidth="2" />
          
          <path d="M285 70C305 100 310 130 300 155C290 125 275 95 285 70Z" className="leaf-leaflet" strokeWidth="2" />
          <path d="M240 120C265 150 270 180 260 205C248 175 230 145 240 120Z" className="leaf-leaflet" strokeWidth="2" />
          <path d="M190 175C215 205 220 235 210 260C198 230 180 200 190 175Z" className="leaf-leaflet" strokeWidth="2" />
        </svg>
      </div>

      {/* Dark Mode Neon Glow Orbs */}
      <div className="neon-orb orb-primary" />
      <div className="neon-orb orb-secondary" />
    </div>
  );
}
