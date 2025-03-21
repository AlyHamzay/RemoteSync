import React, { useState } from 'react';
import { Modal } from 'react-responsive-modal'; // Modal library
import 'react-responsive-modal/styles.css';

const ImagesModal = ({ open, onClose, images, date }) => {
  const [currentIndex, setCurrentIndex] = useState(-1); // Track the currently selected image (-1 means none selected)
  const [isSliderOpen, setIsSliderOpen] = useState(false); // Track whether the slider modal is open

  // Function to handle image click
  const handleImageClick = (index) => {
    setCurrentIndex(index);
    setIsSliderOpen(true); // Open the slider modal
  };

  // Function to navigate to the next image
  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  // Function to navigate to the previous image
  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  return (
    <>
      {/* Gallery Modal */}
      <Modal open={open} onClose={onClose} center>
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-4">Image Gallery</h2>

          {/* Gallery view */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: '10px',
            }}
          >
            {images.map((image, index) => (
              <div
                key={index}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                }}
                onClick={() => handleImageClick(index)} // Set the clicked image as the current image
              >
                <img
                  src={image}
                  alt={`Slide ${index}`}
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* Slider Modal */}
      <Modal
        open={isSliderOpen}
        onClose={() => setIsSliderOpen(false)} // Close the slider modal
        styles={{
          modal: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)', // Dark background
            padding: '0',
            position: 'relative',
            width: '80%',
            height: '80%',
          },
        }}
      >
        {/* Blur effect */}
        <div
          style={{
            filter: 'blur(8px)',
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            zIndex: '-1',
            background: `url(${images[currentIndex]}) center/cover no-repeat`,
          }}
        ></div>

        {/* Fullscreen image */}
        <div
          style={{
            position: 'absolute',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <img
            src={images[currentIndex]}
            alt={`Image ${currentIndex}`}
            style={{
              maxHeight: '80%',
              maxWidth: '90%',
              borderRadius: '8px',
              zIndex: '1',
            }}
          />
          <div style={{ color: '#fff', fontSize: '16px' }}>
            {date[currentIndex] || 'Date not available'}
          </div>
        </div>

        {/* Left arrow */}
        <button
          onClick={handlePrev}
          style={{
            position: 'absolute',
            top: '50%',
            left: '10px',
            transform: 'translateY(-50%)',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            border: 'none',
            padding: '10px',
            borderRadius: '50%',
            cursor: 'pointer',
            zIndex: '2',
          }}
        >
          &#9664;
        </button>

        {/* Right arrow */}
        <button
          onClick={handleNext}
          style={{
            position: 'absolute',
            top: '50%',
            right: '10px',
            transform: 'translateY(-50%)',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            border: 'none',
            padding: '10px',
            borderRadius: '50%',
            cursor: 'pointer',
            zIndex: '2',
          }}
        >
          &#9654;
        </button>
      </Modal>
    </>
  );
};

export default ImagesModal;
