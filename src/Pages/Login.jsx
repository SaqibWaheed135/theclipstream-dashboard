import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../Context/AuthContext';
import logo from '../assets/logo.png'
import axios from 'axios';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) navigate('/dashboard');
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true); // Start loading


        try {
            const res = await axios.post('https://api.theclipstream.com/api/admin/admin-login', {
                email,
                password,
            });

            const data = res.data;

            localStorage.setItem('token', data.token);
            login(res); // If `login()` expects the full response, keep this as-is
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Login failed');
        }
        finally {
            setLoading(false); // Stop loading
        }
    };

   

    return (
        <div style={styles.wrapper}>
             {
        loading && (
            <div style={styles.loaderOverlay}>
                <div style={styles.loaderBox}>
                    <div className="spinner" style={styles.spinner}></div>
                    <p>Logging in...</p>
                </div>
            </div>
        )
    }
            <div style={styles.leftPanel}>
                <img src={logo} alt="Logo" style={styles.logo} />
                <h2 style={styles.brand}>Your clips, your stream, your stage.</h2>
            </div>
            {/* Center Line */}
            <div style={styles.separator}></div>

            <div style={styles.rightPanel}>
                <h1 style={styles.welcome}>Welcome</h1>
                <p style={styles.subtext}>Please login to Admin Dashboard.</p>

                <form onSubmit={handleLogin} style={styles.form}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={styles.input}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={styles.input}
                        required
                    />
                    {error && <p style={styles.error}>{error}</p>}

                    <button type="submit" style={styles.button}>LOGIN</button>
                </form>
            </div>
        </div>
    );
};

const styles = {
    wrapper: {
        display: 'flex',
        height: '100vh',
        backgroundColor: '#fff',
    },
    leftPanel: {
        flex: 1,
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: 150,
        height: 120,
        marginBottom: 20,
        borderRadius: 10
    },
    brand: {
        color: '#003b3f',
        fontSize: '18px',
    },
    rightPanel: {
        flex: 1,
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '0 80px',
        color: '#ffffff',
        gap: 10
    },
    welcome: {
        fontSize: '32px',
        marginBottom: 10,
        color: '#003b3f'
    },
    subtext: {
        fontSize: '14px',
        marginBottom: 40,
        letterSpacing: '1px',
        color: '#003b3f'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    input: {
        padding: '12px 15px',
        borderRadius: '4px',
        fontSize: '16px',
        backgroundColor: '#ffffff',
        color: '#000',
        width: '80%',
        border: '1px solid rgb(240, 185, 224)  '
    },
    button: {
        padding: '12px',
        backgroundColor: '#812C84',
        color: '#fff',
        fontWeight: 'bold',
        fontSize: '16px',
        border: 'none',
        cursor: 'pointer',
        width: '50%',
        borderRadius: 6,
        marginLeft: 110,
        marginTop: 40
    },
    forgot: {
        fontSize: '12px',
        color: '#ffffff',
        marginTop: '10px',
        textAlign: 'center',
        cursor: 'pointer',
    },
    error: {
        color: 'red',
        fontSize: '14px',
    },

    separator: {
        width: '1px',
        backgroundColor: '#ccc',
        height: '80%',
        alignSelf: 'center'
    },
    loaderOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        width: '100vw',
        backgroundColor: 'rgba(0,0,0,0.4)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
    },
    loaderBox: {
        backgroundColor: '#fff',
        padding: '20px 30px',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    spinner: {
        width: '40px',
        height: '40px',
        border: '4px solid #ccc',
        borderTop: '4px solid #A4508B',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '10px',
    },

};



export default Login;