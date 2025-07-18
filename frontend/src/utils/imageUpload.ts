// Utility function to upload canvas image data to server
export const uploadCanvasImage = async (canvas: HTMLCanvasElement, filename: string): Promise<string> => {
  try {
    // Convert canvas to blob
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob from canvas'));
        }
      }, 'image/png');
    });

    // Create FormData
    const formData = new FormData();
    formData.append('image', blob, `${filename}.png`);
    formData.append('filename', filename);

    // Upload to server
    const response = await fetch('/api/upload/customized-image', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('stepstunnerToken')}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    const result = await response.json();
    return result.imageUrl; // Return the URL of the saved image
  } catch (error) {
    console.error('Error uploading canvas image:', error);
    throw error;
  }
};

// Utility function to get canvas as base64 data URL
export const getCanvasAsDataURL = (canvas: HTMLCanvasElement): string => {
  return canvas.toDataURL('image/png');
};

// Utility function to get canvas as blob
export const getCanvasAsBlob = async (canvas: HTMLCanvasElement): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Failed to create blob from canvas'));
      }
    }, 'image/png');
  });
}; 