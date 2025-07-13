import React, { useRef, useState } from 'react'
import { LuUser, LuUpload  } from "react-icons/lu";
import { IoTrashSharp } from "react-icons/io5";
const ProfilePhotoSelector = ({image, setImage, preview, setPreview}) => {
  
    const inputRef = useRef(null);
    const [previewUrl, setPreviewUrl] = useState(null);
  
  
    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if(file) {
            // update the image state
            setImage(file);
            
            // Generate preview URL from the file
            const preview = URL.createObjectURL(file);
            if(setPreview) {
                setPreview(preview);
            }
            setPreviewUrl(preview);
        }
    };

        const handleRemoveImage = () => {
            setImage(null);
            setPreviewUrl(null)

            if(setPreview) {
                setPreview(null);
            }
        };

        const onChooseFile =() =>{
            inputRef.current.click();
        };

    return (
    <div className='flex justify-center mb-3'>
        <input type="file"
        accept='image/*'
        ref={inputRef}
        onChange={handleImageChange}
        className='hidden' 
        />

        {!image ? (
            <div className='w-20 h-20 flex items-center justify-center bg-orange-50 rounded-full relative cursor-pointer'>
                <LuUser className='text-4xl text-orange-500 ' />
                <button type='button'
                 className='w-7 h-7 flex items-center justify-center bg-orange-200 rounded-full absolute -bottom-1 -right-1 cursor-pointer'
                 onClick={onChooseFile}
                >
                    <LuUpload />
                </button>
            </div>
        ) : (
            <div className='relative'>
                <img src={preview || previewUrl} alt="profile_photo" className='w-20 h-20 rounded-full object-cover' />
                <button type='button' className='w-7 h-7 flex items-center justify-center bg-red-500 text-white rounded-full absolute -bottom-1 -right-1 cursor-pointer'
                    onClick={handleRemoveImage}
                >
                    <IoTrashSharp  />
                </button>
            </div>
        )}
    </div>
  )
};

export default ProfilePhotoSelector