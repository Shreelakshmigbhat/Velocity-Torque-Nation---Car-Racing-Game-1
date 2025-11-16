import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { AlertCircle, CheckCircle, User, Lock, Mail, Trophy, LogOut } from 'lucide-react';

const CompleteRacingGame = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuth, setShowAuth] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  // Game states
  const mountRef = useRef(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [modeSelected, setModeSelected] = useState(null);


  const API_URL = 'http://localhost:5000/api';

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user') || localStorage.getItem('demoUser');
    if (token && user) {
      const userData = JSON.parse(user);
      setIsLoggedIn(true);
      setCurrentUser(userData);
      setHighScore(userData.highScore || 0);
      setShowAuth(false);
    }
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setMessage({ type: '', text: '' });
  };

  const handleAuth = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (!formData.username || !formData.password) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' });
      setLoading(false);
      return;
    }

    if (!isLogin) {
      if (!formData.email) {
        setMessage({ type: 'error', text: 'Email is required for signup' });
        setLoading(false);
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setMessage({ type: 'error', text: 'Passwords do not match' });
        setLoading(false);
        return;
      }
      if (formData.password.length < 6) {
        setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
        setLoading(false);
        return;
      }
    }

    try {
      const endpoint = isLogin ? `${API_URL}/login` : `${API_URL}/signup`;
      const body = isLogin 
        ? { username: formData.username, password: formData.password }
        : { username: formData.username, email: formData.email, password: formData.password };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setIsLoggedIn(true);
        setCurrentUser(data.user);
        setHighScore(data.user.highScore || 0);
        setShowAuth(false);
        setFormData({ username: '', email: '', password: '', confirmPassword: '' });
      } else {
        setMessage({ type: 'error', text: data.message || 'An error occurred' });
      }
    } catch (error) {
      // Demo mode
      const demoUser = {
        username: formData.username,
        email: formData.email || 'demo@example.com',
        id: Date.now(),
        highScore: 0
      };
      
      setIsLoggedIn(true);
      setCurrentUser(demoUser);
      setHighScore(0);
      setShowAuth(false);
      localStorage.setItem('demoUser', JSON.stringify(demoUser));
      localStorage.setItem('token', 'demo-token');
    }

    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('demoUser');
    setIsLoggedIn(false);
    setCurrentUser(null);
    setShowAuth(true);
    setGameStarted(false);
    setScore(0);
    setHighScore(0);
  };

  const updateHighScore = async (newScore) => {
    if (newScore > highScore) {
      setHighScore(newScore);
      
      // Update in backend
      const token = localStorage.getItem('token');
      if (token && token !== 'demo-token') {
        try {
          await fetch(`${API_URL}/highscore`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ score: newScore })
          });
        } catch (error) {
          console.log('Could not update high score on server');
        }
      }
      
      // Update in localStorage
      const user = JSON.parse(localStorage.getItem('user') || localStorage.getItem('demoUser'));
      if (user) {
        user.highScore = newScore;
        localStorage.setItem(localStorage.getItem('user') ? 'user' : 'demoUser', JSON.stringify(user));
      }
    }
  };

  // Racing Game Logic
  useEffect(() => {
    if (!gameStarted || !isLoggedIn) return;
    
let scene, camera, renderer, car, road, obstacles = [];
    let carSpeed = 0;
    let carPosition = 0;
    let obstacleSpeed = 0.1;
    let gameRunning = true;
    let currentScore = 0;
    let trees = [];

    const keys = { left: false, right: false, up: false, down: false };

    
    // --- City Background Variables ---
    let citySegments = [];
     const CITY_SEGMENT_DEPTH = 60;
     const CITY_SEGMENT_COUNT = 5;
     const TOTAL_CITY_LENGTH = CITY_SEGMENT_DEPTH * CITY_SEGMENT_COUNT;
     const CITY_SPEED_FACTOR = 0.35;

     const BUILDING_COLORS = [
     0x1f2933,
     0x24354a,
      0x2d4157,
      0x35546b,
       0x394861
];

    
   const initNight = () => {
 
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x050b16);
      scene.fog = new THREE.FogExp2(0x050b16, 0.02);

      
      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.set(0, 5, 8);
      camera.lookAt(0, 0, 0);
      
      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.shadowMap.enabled = true;
      mountRef.current.appendChild(renderer.domElement);
      
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);
      
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(5, 10, 5);
      directionalLight.castShadow = true;
      scene.add(directionalLight);
      
     createCar();
createRoad();
createCityBackground();

// --- Create roadside trees ---
// Trees for night mode
for (let i = 0; i < 40; i++) {
  const z = -i * 10;
  const leftTree = createTree(-6, z);
  const rightTree = createTree(6, z);
  trees.push(leftTree, rightTree);
  scene.add(leftTree);
  scene.add(rightTree);
}


      
      for (let i = 0; i < 5; i++) {
        createObstacle(-20 - i * 10);
      }
      
      window.addEventListener('keydown', onKeyDown);
      window.addEventListener('keyup', onKeyUp);
      window.addEventListener('resize', onWindowResize);
      
      animate();
    };
const initDay = () => {
  scene = new THREE.Scene();
      scene.background = new THREE.Color(0x87ceeb);

     scene.fog = new THREE.Fog(0x87ceeb, 10, 50);


      
      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.set(0, 5, 8);
      camera.lookAt(0, 0, 0);
      
      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.shadowMap.enabled = true;
      mountRef.current.appendChild(renderer.domElement);
      
      const ambientLight = new THREE.AmbientLight(0xffffff, 1);


      scene.add(ambientLight);
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
      directionalLight.color.set(0xfff2cc); // warm sunlight

      directionalLight.position.set(5, 10, 5);
      directionalLight.castShadow = true;
      scene.add(directionalLight);
      
     createCar();
createRoad();
createCityBackground();

      
      for (let i = 0; i < 5; i++) {
        createObstacle(-20 - i * 10);
      }
      
      window.addEventListener('keydown', onKeyDown);
      window.addEventListener('keyup', onKeyUp);
      window.addEventListener('resize', onWindowResize);
  animate();
};

    
    // --- Create ONE building ---
const createBuilding = ({ parent, x, z, width, height, depth, color }) => {
  const group = new THREE.Group();
  group.position.set(x, 0, z);

  // Main tower
  const tower = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    new THREE.MeshPhongMaterial({ color, flatShading: true })
  );
  tower.position.y = height / 2;
  tower.castShadow = true;
  group.add(tower);

  // Optional roof
  if (Math.random() > 0.6) {
    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(width * 0.35, 1.4, 4),
      new THREE.MeshPhongMaterial({ color: 0x121720 })
    );
    roof.position.y = height + 0.7;
    group.add(roof);
  }

  // --- Windows (bright yellow rectangles) ---
const windowGeometry = new THREE.PlaneGeometry(0.35, 0.55);
const windowMaterial = new THREE.MeshBasicMaterial({
  color: 0xffe066,
  transparent: true,
  opacity: 0.8
});

const floors = Math.floor(height / 1.2);
const windowsPerFloor = Math.floor(width / 0.6);

for (let floor = 0; floor < floors; floor++) {
  for (let i = 0; i < windowsPerFloor; i++) {
    const win = new THREE.Mesh(windowGeometry, windowMaterial);

    win.position.set(
      -width / 2 + 0.4 + i * 0.6,
      0.5 + floor * 1.2,
      depth / 2 + 0.002   // front face
    );

    // Small random flicker effect
    win.material.opacity = 0.6 + Math.random() * 0.4;

    group.add(win);
  }
}

  parent.add(group);
};

// --- Create a segment of buildings ---
const createCitySegment = (zOffset) => {
  const segment = new THREE.Group();
  segment.position.z = zOffset;

  const laneSets = [
    { lanes: [-11, -14.5, -18], jitter: 1.4 },
    { lanes: [11, 14.5, 18], jitter: -1.4 }
  ];

  laneSets.forEach(({ lanes, jitter }) => {
    lanes.forEach(lane => {
      for (let i = 0; i < 3; i++) {
        const width = 2 + Math.random() * 3;
        const height = 8 + Math.random() * 12;
        const depth = 2 + Math.random() * 3;
        const color = BUILDING_COLORS[Math.floor(Math.random() * BUILDING_COLORS.length)];
        const z = -CITY_SEGMENT_DEPTH/2 + i * (CITY_SEGMENT_DEPTH / 3) + (Math.random()*4 - 2);

        createBuilding({
          parent: segment,
          x: lane + Math.random() * jitter,
          z,
          width,
          height,
          depth,
          color
        });
      }
    });
  });

  return segment;
};

// --- Create background ground + skyline + segments ---
const createCityBackground = () => {
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(220, 400),
    new THREE.MeshPhongMaterial({ color: 0x1a1d28 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.02;
  ground.receiveShadow = true;
  scene.add(ground);

  for (let i = 0; i < CITY_SEGMENT_COUNT; i++) {
    const s = createCitySegment(-CITY_SEGMENT_DEPTH/2 - i * CITY_SEGMENT_DEPTH);
    citySegments.push(s);
    scene.add(s);
  }
};

    const createCar = () => {
      const carGroup = new THREE.Group();
      
      const bodyGeometry = new THREE.BoxGeometry(1.5, 0.8, 2.5);
      const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      body.position.y = 0.4;
      body.castShadow = true;
      carGroup.add(body);
      
      const topGeometry = new THREE.BoxGeometry(1.2, 0.6, 1.5);
      const topMaterial = new THREE.MeshPhongMaterial({ color: 0xcc0000 });
      const top = new THREE.Mesh(topGeometry, topMaterial);
      top.position.set(0, 1, -0.2);
      top.castShadow = true;
      carGroup.add(top);
      
      const wheelGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 16);
      const wheelMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
      
      const wheelPositions = [
        [-0.7, 0.3, 1], [0.7, 0.3, 1],
        [-0.7, 0.3, -1], [0.7, 0.3, -1]
      ];
      
      wheelPositions.forEach(pos => {
        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(...pos);
        wheel.castShadow = true;
        carGroup.add(wheel);
      });
      
      carGroup.position.set(0, 0, 5);
      car = carGroup;
      scene.add(car);
    };
    
    const createRoad = () => {
      const roadGroup = new THREE.Group();
      
      const roadGeometry = new THREE.PlaneGeometry(8, 100);
      const roadMaterial = new THREE.MeshPhongMaterial({ color: 0x555555 });
      const roadMesh = new THREE.Mesh(roadGeometry, roadMaterial);
      roadMesh.rotation.x = -Math.PI / 2;
      roadMesh.receiveShadow = true;
      roadGroup.add(roadMesh);
      
      for (let i = -50; i < 50; i += 5) {
        const lineGeometry = new THREE.PlaneGeometry(0.3, 2);
        const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const line = new THREE.Mesh(lineGeometry, lineMaterial);
        line.rotation.x = -Math.PI / 2;
        line.position.set(0, 0.01, i);
        roadGroup.add(line);
      }
      
      const edgeGeometry = new THREE.BoxGeometry(1, 0.5, 100);
      const edgeMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
      
      const leftEdge = new THREE.Mesh(edgeGeometry, edgeMaterial);
      leftEdge.position.set(-4.5, 0.25, 0);
      roadGroup.add(leftEdge);
      
      const rightEdge = new THREE.Mesh(edgeGeometry, edgeMaterial);
      rightEdge.position.set(4.5, 0.25, 0);
      roadGroup.add(rightEdge);
      
      road = roadGroup;
      scene.add(road);
    };
    
    const createObstacle = (zPos) => {
      const types = ['box', 'cone', 'sphere'];
      const type = types[Math.floor(Math.random() * types.length)];
      let obstacle;
      
      const colors = [0x00ff00, 0x0000ff, 0xffff00, 0xff00ff];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const material = new THREE.MeshPhongMaterial({ color });
      
      if (type === 'box') {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        obstacle = new THREE.Mesh(geometry, material);
      } else if (type === 'cone') {
        const geometry = new THREE.ConeGeometry(0.5, 1.5, 8);
        obstacle = new THREE.Mesh(geometry, material);
        obstacle.position.y = 0.75;
      } else {
        const geometry = new THREE.SphereGeometry(0.6, 16, 16);
        obstacle = new THREE.Mesh(geometry, material);
        obstacle.position.y = 0.6;
      }
      
      obstacle.castShadow = true;
      const lanes = [-2.5, 0, 2.5];
      obstacle.position.x = lanes[Math.floor(Math.random() * lanes.length)];
      obstacle.position.z = zPos;
      
      obstacles.push(obstacle);
      scene.add(obstacle);
    };
    // --- Create a tree (used in both day & night) ---
const createTree = (x, z) => {
  const tree = new THREE.Group();

  // Trunk
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.2, 1.2, 8),
    new THREE.MeshPhongMaterial({ color: 0x8b5a2b })  // brown
  );
  trunk.position.y = 0.6;
  tree.add(trunk);

  // Leaves
  const leaves = new THREE.Mesh(
    new THREE.ConeGeometry(1, 2, 12),
    new THREE.MeshPhongMaterial({ color: 0x2e8b57 })   // green
  );
  leaves.position.y = 2;
  tree.add(leaves);

  tree.position.set(x, 0, z);
  tree.castShadow = true;

  return tree;
};

    
    const onKeyDown = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd') keys.right = true;
      if (e.key === 'ArrowUp' || e.key === 'w') keys.up = true;
      if (e.key === 'ArrowDown' || e.key === 's') keys.down = true;
    };
    
    const onKeyUp = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd') keys.right = false;
      if (e.key === 'ArrowUp' || e.key === 'w') keys.up = false;
      if (e.key === 'ArrowDown' || e.key === 's') keys.down = false;
    };
    
    const onWindowResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    
    const checkCollision = (obj1, obj2) => {
      const box1 = new THREE.Box3().setFromObject(obj1);
      const box2 = new THREE.Box3().setFromObject(obj2);
      return box1.intersectsBox(box2);
    };
    
    const animate = () => {
      if (!gameRunning) return;
      
      requestAnimationFrame(animate);
      
      if (keys.up) carSpeed = Math.min(carSpeed + 0.01, 0.5);
      if (keys.down) carSpeed = Math.max(carSpeed - 0.01, 0);
      if (!keys.up && !keys.down) carSpeed *= 0.98;
      
      if (keys.left) carPosition = Math.max(carPosition - 0.1, -2.5);
      if (keys.right) carPosition = Math.min(carPosition + 0.1, 2.5);
      
      car.position.x = carPosition;
      setSpeed(Math.floor(carSpeed * 200));
      
      obstacleSpeed = 0.1 + carSpeed;
      
      obstacles.forEach(obstacle => {
        obstacle.position.z += obstacleSpeed;
        
        if (checkCollision(car, obstacle)) {
          gameRunning = false;
          setGameOver(true);
          updateHighScore(currentScore);
        }
        
        if (obstacle.position.z > 10) {
          scene.remove(obstacle);
          obstacles = obstacles.filter(o => o !== obstacle);
          createObstacle(-30);
          currentScore += 10;
          setScore(currentScore);
        }
      });
      
      scene.children.forEach(child => {
        if (child === road) {
          child.children.forEach(line => {
            if (line.geometry.type === 'PlaneGeometry' && line.material.color.getHex() === 0xffffff) {
              line.position.z += obstacleSpeed;
              if (line.position.z > 50) line.position.z = -50;
            }
          });
        }
      });
      // Move city background
const parallaxSpeed = 0.112 + obstacleSpeed * CITY_SPEED_FACTOR;

citySegments.forEach(segment => {
  segment.position.z += parallaxSpeed;

  if (segment.position.z > camera.position.z + CITY_SEGMENT_DEPTH) {
    segment.position.z -= TOTAL_CITY_LENGTH;
  }
});

      
      renderer.render(scene, camera);
    };
    
    if (modeSelected === "night") initNight();
if (modeSelected === "day") initDay();

    
    return () => {
      gameRunning = false;
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('resize', onWindowResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [gameStarted, isLoggedIn]);

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setSpeed(0);
  };

  const restartGame = () => {
    setGameStarted(false);
    setTimeout(() => startGame(), 100);
  };

  // Auth UI
  if (showAuth || !isLoggedIn) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
       background: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.8)), url('/vel.png') center/cover no-repeat`,

        fontFamily: 'Arial, sans-serif',
        padding: '20px'
      }}>
        <div style={{
  backgroundColor: 'rgba(255, 255, 255, 0.15)',
  borderRadius: '20px',
  padding: '40px',
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)', // Safari support
  border: '1px solid rgba(255, 255, 255, 0.3)',
  maxWidth: '450px',
  width: '100%'
}}>

          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h1 style={{ fontSize: '36px', margin: '0 0 10px 0', color: '#d53434ff' }}>
              🏎️ Racing Game
            </h1>
            <p style={{ color: '#d5ceceff', margin: 0 }}>
              {isLogin ? 'Login to start racing!' : 'Create an account to play'}
            </p>
          </div>

          {message.text && (
            <div style={{
              padding: '15px',
              borderRadius: '10px',
              marginBottom: '20px',
              backgroundColor: message.type === 'error' ? '#fee' : '#efe',
              border: `1px solid ${message.type === 'error' ? '#fcc' : '#cfc'}`,
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              {message.type === 'error' ? (
                <AlertCircle size={20} color="#c00" />
              ) : (
                <CheckCircle size={20} color="#0c0" />
              )}
              <span style={{ color: message.type === 'error' ? '#c00' : '#0c0' }}>
                {message.text}
              </span>
            </div>
          )}

          <div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: '500' }}>
                Username
              </label>
              <div style={{ position: 'relative' }}>
                <User size={20} style={{
                  position: 'absolute',
                  left: '15px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#999'
                }} />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Enter your username"
                  onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
                  style={{
                    width: '100%',
                    padding: '15px 15px 15px 45px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '10px',
                    fontSize: '16px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {!isLogin && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: '500' }}>
                  Email
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={20} style={{
                    position: 'absolute',
                    left: '15px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#999'
                  }} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
                    style={{
                      width: '100%',
                      padding: '15px 15px 15px 45px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '10px',
                      fontSize: '16px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>
            )}

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: '500' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={20} style={{
                  position: 'absolute',
                  left: '15px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#999'
                }} />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
                  style={{
                    width: '100%',
                    padding: '15px 15px 15px 45px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '10px',
                    fontSize: '16px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {!isLogin && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: '500' }}>
                  Confirm Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={20} style={{
                    position: 'absolute',
                    left: '15px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#999'
                  }} />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm your password"
                    onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
                    style={{
                      width: '100%',
                      padding: '15px 15px 15px 45px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '10px',
                      fontSize: '16px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>
            )}

            <button
              onClick={handleAuth}
              disabled={loading}
              style={{
                width: '100%',
                padding: '15px',
                backgroundColor: loading ? '#ccc' : '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginBottom: '15px'
              }}
            >
              {loading ? 'Processing...' : (isLogin ? 'Login & Play' : 'Sign Up & Play')}
            </button>
          </div>

          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#666' }}>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setFormData({ username: '', email: '', password: '', confirmPassword: '' });
                  setMessage({ type: '', text: '' });
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#667eea',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                {isLogin ? 'Sign Up' : 'Login'}
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Game UI

  // ⭐ MODE SELECTION SCREEN GOES HERE ⭐

if (!modeSelected) {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontFamily: "Arial, sans-serif",

        // ⭐ USE THIS ⭐
        background: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)),
                     url('/vel.png') center/cover no-repeat`,
      }}
    >
      <h1 style={{ fontSize: "42px", marginBottom: "30px" }}>
        Choose Mode
      </h1>

      <button
        onClick={() => setModeSelected("day")}
        style={{
          padding: "20px 40px",
          marginBottom: "20px",
          fontSize: "48px",
          background: "#87CEEB",
          borderRadius: "10px",
          border: "none",
          cursor: "pointer",
          fontWeight: "bold"
        }}
      >
        🌞 Day Mode
      </button>

      <button
        onClick={() => setModeSelected("night")}
        style={{
          padding: "20px 40px",
          fontSize: "48px",
          background: "#061d48ff",
          color: "white",
          borderRadius: "10px",
          border: "none",
          cursor: "pointer",
          fontWeight: "bold"
        }}
      >
        🌙 Night Mode
      </button>
    </div>
  );
}

// Game UI


  
  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
      
      {!gameStarted && !gameOver && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          color: 'white',
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          padding: '40px',
          borderRadius: '20px',
          fontFamily: 'Arial, sans-serif',
          minWidth: '400px'
        }}>
          <h1 style={{ fontSize: '48px', marginBottom: '10px' }}>🏎️ Racing Game</h1>
          <p style={{ fontSize: '20px', marginBottom: '20px' }}>Welcome, {currentUser.username}!</p>
          <div style={{ 
            backgroundColor: 'rgba(255,255,255,0.1)', 
            padding: '15px', 
            borderRadius: '10px',
            marginBottom: '30px'
          }}>
            <p style={{ margin: '5px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <Trophy size={20} color="#ffd700" />
              <span>High Score: {highScore}</span>
            </p>
          </div>
          <p style={{ fontSize: '18px', marginBottom: '30px' }}>Use Arrow Keys or WASD to control</p>
          <button
            onClick={startGame}
            style={{
              fontSize: '24px',
              padding: '15px 40px',
              backgroundColor: '#ff0000',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 'bold',
              marginBottom: '15px',
              width: '100%'
            }}
          >
            Start Game
          </button>
          <button
            onClick={handleLogout}
            style={{
              fontSize: '16px',
              padding: '10px 20px',
              backgroundColor: 'transparent',
              color: 'white',
              border: '2px solid white',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 'bold',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      )}
      
      {gameOver && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          color: 'white',
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          padding: '40px',
          borderRadius: '20px',
          fontFamily: 'Arial, sans-serif',
          minWidth: '400px'
        }}>
          <h1 style={{ fontSize: '48px', marginBottom: '20px', color: '#ff0000' }}>Game Over!</h1>
          <p style={{ fontSize: '32px', marginBottom: '10px' }}>Score: {score}</p>
          <div style={{ 
            backgroundColor: 'rgba(255,255,255,0.1)', 
            padding: '15px', 
            borderRadius: '10px',
            marginBottom: '30px'
          }}>
            <p style={{ margin: '5px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <Trophy size={24} color="#ffd700" />
              <span style={{ fontSize: '24px' }}>High Score: {highScore}</span>
            </p>
            {score > highScore && (
              <p style={{ color: '#00ff00', marginTop: '10px', fontSize: '18px' }}>
                🎉 New High Score! 🎉
              </p>
            )}
          </div>
          <button
            onClick={restartGame}
            style={{
              fontSize: '24px',
              padding: '15px 40px',
              backgroundColor: '#00ff00',
              color: 'black',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 'bold',
              marginBottom: '15px',
              width: '100%'
            }}
          >
            Play Again
          </button>
          <button
            onClick={handleLogout}
            style={{
              fontSize: '16px',
              padding: '10px 20px',
              backgroundColor: 'transparent',
              color: 'white',
              border: '2px solid white',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 'bold',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      )}
      
      {gameStarted && !gameOver && (
        <>
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            color: 'white',
            fontFamily: 'Arial, sans-serif',
            fontSize: '24px',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            padding: '20px',
            borderRadius: '10px',
            minWidth: '200px'
          }}>
            <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <User size={20} />
              <span>{currentUser.username}</span>
            </div>
            <div style={{ marginBottom: '10px' }}>Score: {score}</div>
            <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Trophy size={20} color="#ffd700" />
              <span>Best: {highScore}</span>
            </div>
            <div>Speed: {speed} km/h</div>
          </div>
          
          <button
            onClick={handleLogout}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              padding: '12px 24px',
              backgroundColor: 'rgba(220, 53, 69, 0.9)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: 'Arial, sans-serif'
            }}
          >
            <LogOut size={18} />
            Logout
          </button>
        </>
      )}
    </div>
  );
};

export default CompleteRacingGame;
