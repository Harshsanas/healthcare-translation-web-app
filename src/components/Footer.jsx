import React from 'react'

export default function Footer() {
  return (
    <div className="sticky bottom-0 z-50 w-full border-t border-gray-200 bg-white/95 backdrop-blur-md">
      <div className="pt-8">
        <p>&copy; {new Date().getFullYear()} Healthcare Translate. All rights reserved.</p>
      </div>
    </div>
  );
}
