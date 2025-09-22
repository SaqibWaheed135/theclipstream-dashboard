import { useState } from 'react';
import axios from 'axios';

export default function VideoUpload() {
    const [video, setVideo] = useState(null);
    const [description, setDescription] = useState('');
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');

    const handleVideoChange = (e) => {
        setVideo(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!video || !description) {
            setMessage('Please select a video and write a description.');
            return;
        }

        try {
            setUploading(true);
            setMessage('Requesting upload URL...');

            // Step 1: Get signed upload and view URLs
            const signedRes = await axios.post('https://earnkar-backend-code.vercel.app/api/auth/uploadVideo', {
                fileName: video.name,
                fileType: video.type,
            });

            const { uploadUrl, fileUrl } = signedRes.data;

            // Step 2: Upload video to Wasabi
            setMessage('Uploading video to storage...');

            await fetch(uploadUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': video.type,
                },
                body: video,
            });

            // Step 3: Save video record to DB with signed fileUrl
            setMessage('Saving video metadata to database...');

            const saveRes = await axios.post('https://earnkar-backend-code.vercel.app/api/auth/addVideo', {
                uri: fileUrl, // ✅ signed 7-day getObject URL
                user: 'EarnKar Team',
                avatar: 'https://cdn-icons-png.flaticon.com/128/7641/7641727.png',
                description,
                isAdmin: true,
            });

            if (saveRes.status === 200) {
                setMessage('Video uploaded and saved successfully!');
                setVideo(null);
                setDescription('');
            } else {
                setMessage('Failed to save video');
            }
        } catch (err) {
            console.error('Upload error:', err);
            setMessage('Error uploading video');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="withdraw-container">
            <h2>Admin: Upload Video</h2>
            <input type="file" accept="video/*" onChange={handleVideoChange} />
            <br /><br />
            <textarea
                placeholder="Enter video description..."
                rows="4"
                style={{ width: '80%', padding: 10 }}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />
            <br /><br />
            <button onClick={handleUpload} disabled={uploading} style={{
                backgroundColor: '#5F0A87',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '14px',
                fontFamily: 'Poppins',
            }}>
                {uploading ? 'Uploading...' : 'Upload Video'}
            </button>
            <p>{message}</p>
        </div>
    );
}