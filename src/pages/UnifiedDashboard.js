// UnifiedDashboard.js
import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { saveToken, getTokenPayload } from '../utils/token';
import SenderDashboard from './SenderDashboard';
import HandlerDashboard from './HandlerDashboard';
import AdminLayout from '../components/AdminLayout';
import { Outlet, Routes, Route, useNavigate } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import AdminUsers from './AdminUsers';
import AdminParcels from './AdminParcels';
import AdminTamperAlerts from './AdminTamperAlerts';
import AdminAnalytics from './AdminAnalytics';
import { createParcel, fetchMyParcels, getParcelsHandledByHandler, fetchQRCode } from '../api/parcel';
import { fetchParcelStatusLogs } from '../api/status';
import DashboardHeader from '../components/DashboardHeader';
import TimelineModal from '../components/TimelineModal';
import { fetchTimeline } from '../api/timeline';
import { FiPackage, FiClock, FiCheckCircle, FiAlertCircle, FiMapPin, FiRefreshCcw, FiAlertTriangle, FiTruck, FiUser, FiUsers, FiBarChart2 } from 'react-icons/fi';
import { toast, ToastContainer } from 'react-toastify';
import { Bar, Pie } from 'react-chartjs-2';
import { Toaster } from 'react-hot-toast';
import { logHandover } from '../api/handover';
import { raiseTamperAlert } from '../api/tamper';
import { fetchUsers, fetchAlerts, fetchParcels } from '../api/admin';
import AdminSidebar from '../components/AdminSidebar';
import QRCodeScanner from "../components/QRCodeScanner";
import RouteMap from '../components/RouteMap';
import { fetchRouteByTrackingId } from "../api/route";
import QRCodeModal from '../components/QRCodeModal';
import LocomotiveScroll from "locomotive-scroll";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ArcElement, Tooltip, Legend);

gsap.registerPlugin(ScrollTrigger);

export default function UnifiedDashboard() {
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  // --- ADMIN states ---
  const [parcels, setParcels] = useState([]);
  const [userCount, setUserCount] = useState(null);
  const [handlerCount, setHandlerCount] = useState(null);
  const [alertCount, setAlertCount] = useState(null);
  const [latestAlerts, setLatestAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminActivePage, setAdminActivePage] = useState('dashboard');

  // --- HANDLER states ---
  // Navigation
  const [trackingId, setTrackingId] = useState('');
  const [location, setLocation] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Data States
  const [result, setResult] = useState(null);
  // parcels is shared above
  const [users, setUsers] = useState([]);

  // Modal & Status States
  const [selectedTimeline, setSelectedTimeline] = useState(null);
  const [showTimeline, setShowTimeline] = useState(false);
  const [statusStages, setStatusStages] = useState([]);
  const [showStatusPopup, setShowStatusPopup] = useState(false);
  const [currentTrackingId, setCurrentTrackingId] = useState('');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Constants
  const statusFlow = ['Received', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];

  //QRCodeScanner
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  // const [trackingId, setTrackingId] = useState('');
  // const [location, setLocation] = useState('');

  // --- SENDER states ---
  const [recipientName, setRecipientName] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [myParcels, setMyParcels] = useState([]);
  const [loadingParcels, setLoadingParcels] = useState(false);
  const [creatingParcel, setCreatingParcel] = useState(false);
  const [senderAddress, setSenderAddress] = useState('');
  const [parcelCategory, setParcelCategory] = useState('');
  const [weight, setWeight] = useState('');

  const statusList = ['Received', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];

  // --- Handler Memoized Map ---
  const handlersMap = useMemo(() => {
    const map = {};
    users.forEach((user) => {
      if (user.role?.toLowerCase() === 'handler') {
        map[user.id] = user.email || 'Unknown Handler';
      }
    });
    return map;
  }, [users]);

  // --- Handler filtered parcels by search and status ---
  const filteredParcels = parcels.filter((p) => {
    const term = searchTerm.toLowerCase();
    const status = p.status?.toLowerCase() || '';
    const matchesSearch = p.trackingId?.toLowerCase().includes(term) || p.recipientName?.toLowerCase().includes(term);
    const matchesStatus = statusFilter === 'all' || status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // --- Sender chart data ---
  const deliveredCount = myParcels.filter(p => (p.status ?? '').toLowerCase() === 'delivered').length;
  const inTransitCount = myParcels.filter(p =>
    ['packed', 'shipped', 'out for delivery'].includes((p.status ?? '').toLowerCase())
  ).length;
  const pendingCount = myParcels.length - deliveredCount - inTransitCount;

  const senderChartData = {
    labels: ['Delivered', 'In Transit', 'Pending'],
    datasets: [
      {
        label: 'Parcels',
        data: [deliveredCount, inTransitCount, pendingCount],
        backgroundColor: ['#34D399', '#FBBF24', '#6B7280'], // green, yellow, gray
        borderRadius: 6,
      },
    ],
  };

  const senderChartOptions = {
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1, color: '#D1D5DB' } },
      x: { ticks: { color: '#D1D5DB' } },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  // --- Handler chart data ---
  const handlerChartData = {
    labels: statusFlow,
    datasets: [
      {
        label: 'Parcels',
        data: statusFlow.map(s => parcels.filter(p => (p.status ?? '').toLowerCase() === s.toLowerCase()).length),
        backgroundColor: [
          '#22c55e', // green
          '#facc15', // yellow
          '#3b82f6', // blue
          '#8b5cf6', // indigo
          '#ef4444', // red
        ],
        borderWidth: 1,
      },
    ],
  };

  // --- Admin chart data ---
  const adminChartData = {
    labels: statusFlow,
    datasets: [
      {
        label: 'Parcels by Status',
        data: statusFlow.map(s => parcels.filter(p => (p.status ?? '').toLowerCase() === s.toLowerCase()).length),
        backgroundColor: ['#60a5fa', '#facc15', '#34d399', '#f97316', '#10b981'],
        borderColor: '#1f2937',
        borderWidth: 1
      }
    ]
  };

  const adminChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: { color: 'white' },
      },
    },
    scales: {
      x: {
        ticks: { color: 'white' },
        grid: { color: '#374151' }
      },
      y: {
        ticks: { color: 'white' },
        grid: { color: '#374151' }
      },
    }
  };

  // --- Functions ---

  //Admin: stuff
  const total = parcels.length;
  const delivered = parcels.filter(p => (p.status ?? '').toLowerCase() === 'delivered').length;
  const inTransit = parcels.filter(p => ['shipped', 'out for delivery', 'packed'].includes((p.status ?? '').toLowerCase())).length;
  const received = parcels.filter(p => (p.status ?? '').toLowerCase() === 'received').length;

  // Sender: Create Parcel
  const handleCreate = async () => {
    if (!recipientName.trim() || !deliveryAddress.trim()) {
      toast.error('Please enter both Recipient Name and Delivery Address');
      return;
    }
    setCreatingParcel(true);
    try {
      const data = await createParcel({
        recipientName: recipientName.trim(),
        deliveryAddress: deliveryAddress.trim(),
        senderAddress: senderAddress.trim(),
        parcelCategory,
        weight: parseFloat(weight),
      });
      setResult(data);
      toast.success('Parcel created successfully!');
      fetchSenderParcels();
      setRecipientName('');
      setDeliveryAddress('');
    } catch (error) {
      console.error('Failed to create parcel:', error);
      toast.error('Failed to create parcel');
    } finally {
      setCreatingParcel(false);
    }
  };

  // Sender: Fetch sender parcels
  const fetchSenderParcels = async () => {
    setLoadingParcels(true);
    try {
      const data = await fetchMyParcels();
      setMyParcels(data);
    } catch (error) {
      console.error('Failed to load your parcels:', error);
      toast.error('Failed to load your parcels');
    } finally {
      setLoadingParcels(false);
    }
  };

  // Handler: Fetch parcels handled by this handler
  const fetchHandlerParcels = async () => {
    try {
      const data = await getParcelsHandledByHandler();
      setParcels(data);
    } catch (error) {
      console.error('Failed to fetch handled parcels:', error);
      toast.error('Failed to fetch parcels');
    }
  };

  // Handler: Fetch all users (for handlers)
  const fetchAllUsers = async () => {
    try {
      const u = await fetchUsers();
      setUsers(u);
    } catch {
      toast.error('Failed to load users');
    }
  };

  // Handler: QRCodeScannerSuccess
  const handleScanSuccess = ({ trackingId, location }) => {
    setTrackingId(trackingId || "");
    setLocation(location || "");
    setScannerOpen(false);
    };

  // Handler: Log handover form submit
  const handleLogHandover = async () => {
    if (!trackingId.trim() || !location.trim() || !selectedStatus) {
      toast.error('Please fill all the fields');
      return;
    }
    try {
      const data = await logHandover({
        parcelTrackingId: trackingId.trim(),
        action: selectedStatus,
        location: location.trim(),
      });
      setResult(data);
      toast.success('Handover logged successfully!');
      if (data.tamperDetected) {
        toast.error(`Tamper Alert: ${data.tamperMessage || 'Potential tampering detected!'}`, { duration: 8000, icon: '⚠' });
      }
      setTrackingId('');
      setLocation('');
      setSelectedStatus('');
      await fetchHandlerParcels();
    } catch (error) {
      console.error('Handover logging failed:', error);
      toast.error('Handover failed. Check Tracking ID and try again.');
    }
  };

  // Handler: Show status popup
  const handleShowStatus = async (trackingId) => {
    try {
      const logs = await fetchParcelStatusLogs(trackingId);
      if (logs.length === 0) {
        setStatusStages(['Received']);
      } else {
        setStatusStages(logs.map((log) => log.status));
      }
      setCurrentTrackingId(trackingId);
      setShowStatusPopup(true);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setStatusStages(['Received']);
        setCurrentTrackingId(trackingId);
        setShowStatusPopup(true);
      } else {
        console.error('Status fetch error:', error);
        toast.error('Could not fetch status.');
      }
    }
  };

  // Handler: Show timeline modal
  const handleShowTimeline = async (trackingId) => {
    try {
      const data = await fetchTimeline(trackingId);
      setSelectedTimeline(data);
      setShowTimeline(true);
    } catch (error) {
      console.error('Failed to fetch timeline:', error);
      toast.error('Failed to fetch timeline');
    }
  };

  // Handler: Raise tamper alert manually
  const handleTamper = async (trackingId) => {
    try {
      const res = await raiseTamperAlert({
        parcelTrackingId: trackingId,
        note: 'Tamper alert manually raised by handler.'
      });
      toast.success(res.message || 'Tamper alert sent!');
    } catch (error) {
      console.error('Tamper alert failed:', error);
      toast.error('Failed to raise tamper alert');
    }
  };

  //RouteMap
  const [showMap, setShowMap] = useState(false);
  const [routeData, setRouteData] = useState(null);

  const handleShowRoute = async (trackingId) => {
    try {
      const data = await fetchRouteByTrackingId(trackingId);
      setRouteData(data);
      setShowMap(true);
      } catch (err) {
      console.error("Failed to fetch route", err);
      }
      };

  //QR Code Modal
  const [qrCode, setQrCode] = React.useState(null);
  const [showQrModal, setShowQrModal] = React.useState(false);

  const openQRCodeModal = async (trackingId) => {
    setShowQrModal(true);
    setQrCode(null); // reset

    try {
      const data = await fetchQRCode(trackingId);
      setQrCode(data.qrCode);
     } catch (error) {
      console.error('Failed to fetch QR code', error);
      // optionally show toast error here
     }
    };

  const closeQRCodeModal = () => {
    setShowQrModal(false);
    setQrCode(null);
  };

  //ripple effect
  const [ripples, setRipples] = useState({});  
  const scrollRef = useRef(null);

  const handleClickRipple = useCallback(
    (sectionId) => (e) => {
      const section = e.currentTarget;
      const rect = section.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const newRipple = { id: Date.now(), x, y };

      setRipples((prev) => {
        const sectionRipples = prev[sectionId] || [];
        return {
          ...prev,
          [sectionId]: [...sectionRipples, newRipple],
        };
      });

      setTimeout(() => {
        setRipples((prev) => {
          const sectionRipples = prev[sectionId] || [];
          return {
            ...prev,
            [sectionId]: sectionRipples.filter((r) => r.id !== newRipple.id),
          };
        });
      }, 700);
    },
    []
  );

  const renderRipples = (sectionId) => {
    const sectionRipples = ripples[sectionId] || [];
    return sectionRipples.map(({ id, x, y }) => (
      <span key={id} className="ripple" style={{ top: y, left: x }} />
    ));
  };

  // Initial data fetch on mount based on role
  useEffect(() => {
  let scrollInstance = null;

  (async () => {
    const payload = getTokenPayload();
    if (!payload?.role) return;
    const role = payload.role.toLowerCase();
    setUserRole(role);
    try {
      if (role === 'admin') {
        const parcelData = await fetchParcels();
        const userData = await fetchUsers();
        const alertData = await fetchAlerts();

        setParcels(parcelData);
        setUserCount(userData.length);
        setHandlerCount(userData.filter(u => u.role === 'Handler').length);
        setAlertCount(alertData.length);
        setLatestAlerts(alertData.slice(0, 5));
      } else if (role === 'handler') {
        const data = await getParcelsHandledByHandler();
        setParcels(data);
      } else if (role === 'sender') {
        await fetchSenderParcels();

        // Initialize LocomotiveScroll for sender
        if (scrollRef.current) {
          scrollInstance = new LocomotiveScroll({
            el: scrollRef.current,
            smooth: true,
            multiplier: 1.0,
            smartphone: { smooth: true },
            tablet: { smooth: true },
          });

          // Connect ScrollTrigger with LocomotiveScroll
          ScrollTrigger.scrollerProxy(scrollRef.current, {
            scrollTop(value) {
              if (arguments.length) {
                scrollInstance.scrollTo(value, 0, 0);
              } else {
                return scrollInstance.scroll.instance.scroll.y;
              }
            },
            getBoundingClientRect() {
              return {
                top: 0,
                left: 0,
                width: window.innerWidth,
                height: window.innerHeight,
              };
            },
            pinType: scrollRef.current.style.transform ? 'transform' : 'fixed',
          });

          scrollInstance.on('scroll', ScrollTrigger.update);
          ScrollTrigger.addEventListener('refresh', () => scrollInstance.update());
          ScrollTrigger.refresh();

          // GSAP reveal animations
          gsap.utils.toArray('.reveal').forEach((el) => {
            gsap.fromTo(
              el,
              { autoAlpha: 0, y: 50 },
              {
                duration: 1,
                autoAlpha: 1,
                y: 0,
                ease: 'power3.out',
                scrollTrigger: {
                  trigger: el,
                  scroller: scrollRef.current,
                  start: 'top 80%',
                  end: 'bottom 20%',
                  toggleActions: 'play none none reverse',
                },
              }
            );
          });
        }
      }
    } catch (err) {
      toast.error('Failed to fetch role-specific data');
    } finally {
      setLoading(false);
    }
  })();

  return () => {
    if (scrollInstance) {
      scrollInstance.destroy();
      ScrollTrigger.killAll();
    }
  };
}, []);

  // Render role-based dashboards

  if (!userRole) return <div>Loading user role...</div>;

  if (userRole === 'admin') {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <AdminSidebar activePage={adminActivePage} onChangePage={setAdminActivePage} />
      <div className="flex-1 flex flex-col">
        
        <main className="flex-1 p-6 overflow-auto">
          {adminActivePage === 'dashboard' && (
            <>
              <h1 className="text-4xl font-bold mb-8">📊 Admin Dashboard</h1>
              {loading ? (
                      <p>Loading dashboard data...</p>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
                          {[
                            { label: 'Total Parcels', value: total, icon: FiPackage, color: 'text-blue-400' },
                            { label: 'Delivered', value: delivered, icon: FiTruck, color: 'text-green-400' },
                            { label: 'In Transit', value: inTransit, icon: FiBarChart2, color: 'text-yellow-300' },
                            { label: 'Total Users', value: userCount, icon: FiUsers, color: 'text-blue-300' },
                            { label: 'Handlers', value: handlerCount, icon: FiUser, color: 'text-purple-300' },
                            { label: 'Tamper Alerts', value: alertCount, icon: FiAlertCircle, color: 'text-red-400' }
                          ].map(({ label, value, icon: Icon, color }) => (
                            <div
                              key={label}
                              className="bg-gray-800 rounded-lg p-6 shadow-lg flex items-center gap-4 transition duration-300 ease-in-out hover:shadow-[0_0_20px_5px_rgba(255,255,255,0.1)] hover:scale-[1.03] cursor-pointer"
                            >
                              <Icon size={40} className={color} />
                              <div>
                                <h2 className="text-xl font-semibold">{label}</h2>
                                <p className="text-3xl font-bold">{value}</p>
                              </div>
                            </div>
                          ))}
                        </div>
              
                        {/* Bar Chart */}
                        <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-12 max-w-4xl">
                          <h2 className="text-xl font-bold mb-4">📦 Parcel Status Distribution</h2>
                          <Bar data={adminChartData} options={adminChartOptions} />
                        </div>
              
                        {latestAlerts.length > 0 && (
                          <div className="bg-gray-800 p-6 rounded shadow max-w-4xl">
                            <h2 className="text-xl font-bold mb-4 text-red-400">🚨 Recent Tamper Alerts</h2>
                            <ul className="list-disc list-inside space-y-2 text-sm">
                              {latestAlerts.map(alert => (
                                <li key={alert.id ?? alert.parcelTrackingId}>
                                  Parcel <strong>{alert.parcelTrackingId ?? 'Unknown'}</strong>: {alert.note ?? alert.message ?? 'No message'}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </>
                    )}
            </>
          )}

          {adminActivePage === 'users' && <AdminUsers />}
          {adminActivePage === 'parcels' && <AdminParcels />}
          {adminActivePage === 'tamper-alerts' && <AdminTamperAlerts />}
          {adminActivePage === 'analytics' && (
            <AdminAnalytics
              chartData={adminChartData}
              chartOptions={adminChartOptions}
            />
          )}
        </main>
      </div>
    </div>
  );
}


  if (userRole === 'handler') {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black text-white p-6 flex flex-col gap-8">
      <Toaster position="top-right" />

      <DashboardHeader title="Handler Dashboard" />

      {/* Grid Container */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* --- Left Column: Handover Log Form --- */}
        <section className="bg-gray-850 bg-opacity-60 backdrop-blur-md p-6 rounded-lg shadow-lg flex flex-col gap-4">
          <h3 className="text-2xl font-semibold mb-4">Log Parcel Handover</h3>

          <label className="flex flex-col gap-1 text-gray-300 font-semibold">
            Tracking ID
            <input
              type="text"
              placeholder="Enter Tracking ID"
              value={trackingId}
              onChange={e => setTrackingId(e.target.value)}
              className="p-2 rounded-md bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </label>

          <label className="flex flex-col gap-1 text-gray-300 font-semibold">
            Location
            <input
              type="text"
              placeholder="Enter Current Location"
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="p-2 rounded-md bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </label>

          <label className="flex flex-col gap-1 text-gray-300 font-semibold">
            Status
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="p-2 rounded-md bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select Status</option>
              {statusFlow.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </label>

          <button
            disabled={!trackingId.trim() || !location.trim() || !selectedStatus}
            onClick={handleLogHandover}
            className={`mt-4 py-3 rounded-md font-semibold text-lg transition 
              ${trackingId && location && selectedStatus ? 'bg-indigo-600 hover:bg-indigo-700 cursor-pointer' : 'bg-gray-700 cursor-not-allowed'}
            `}
          >
            Submit Handover
          </button>
          <button
             onClick={() => setScannerOpen(true)}
             className="mt-4 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-semibold"
          >  
              Scan QR Code
          </button>
          <button
            onClick={() => navigate('/all-parcels')}
            className="bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded"
          >
            View All Parcels
          </button>

         <QRCodeScanner
           isOpen={scannerOpen}
           onClose={() => setScannerOpen(false)}
           onScanSuccess={handleScanSuccess}
         />

          {result && (
            <div className="mt-4 p-3 rounded-md bg-gray-800 text-green-400">
              <p>{result.message}</p>
              {result.tampered && (
                <p className="text-red-500 font-semibold mt-1">
                  <FiAlertTriangle className="inline mr-1" /> Tampering Detected: {result.tamperNote}
                </p>
              )}
            </div>
          )}
        </section>

        {/* --- Right Column: Parcel Stats + Search + Table --- */}
        <section className="md:col-span-2 flex flex-col gap-6">

          {/* Statistics Panel */}
          <div className="bg-gray-850 bg-opacity-60 backdrop-blur-md rounded-lg shadow-lg p-6 flex flex-col md:flex-row items-center justify-around gap-8">
            <div className="flex flex-col items-center">
              <FiPackage size={48} className="text-indigo-400" />
              <h4 className="mt-2 text-lg font-semibold">Total Parcels</h4>
              <p className="text-3xl font-bold">{parcels.length}</p>
            </div>
            <div className="flex flex-col items-center">
              <FiClock size={48} className="text-yellow-400" />
              <h4 className="mt-2 text-lg font-semibold">In Transit</h4>
              <p className="text-3xl font-bold">
                {parcels.filter(p =>
                  ['shipped', 'out for delivery', 'packed'].includes((p.status ?? '').toLowerCase())
                ).length}
              </p>
            </div>
            <div className="flex flex-col items-center">
              <FiPackage size={48} className="text-green-400" />
              <h4 className="mt-2 text-lg font-semibold">Delivered</h4>
              <p className="text-3xl font-bold">
                {parcels.filter(p => (p.status ?? '').toLowerCase() === 'delivered').length}
              </p>
            </div>
            <div className="max-w-xs w-full">
              <Pie data={handlerChartData} options={{
                plugins: {
                  legend: { position: 'bottom', labels: { color: 'white' } }
                },
                maintainAspectRatio: true,
              }} />
            </div>
          </div>

          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-850 bg-opacity-60 backdrop-blur-md p-4 rounded-lg shadow-lg">
            <input
              type="text"
              placeholder="Search by Tracking ID or Recipient"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow p-2 rounded-md bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-2 rounded-md bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Statuses</option>
              {statusFlow.map((status) => (
                <option key={status} value={status.toLowerCase()}>{status}</option>
              ))}
            </select>
            <button
              onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-white font-semibold"
              title="Reset filters"
            >
              Reset
            </button>
          </div>

          {/* Parcels Table */}
          <div className="overflow-x-auto rounded-lg shadow-lg bg-gray-850 bg-opacity-60 backdrop-blur-md p-4">
            <table className="min-w-full text-white border-collapse">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="p-3 text-left">Tracking ID</th>
                  <th className="p-3 text-left">Recipient</th>
                  <th className="p-3 text-left">Location</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Timeline</th>
                  <th className="p-3 text-center">Tamper Alert</th>
                  <th className="p-3 text-center">Veiw Route</th>
                </tr>
              </thead>
              <tbody>
                {filteredParcels.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center p-4 text-gray-400 italic">
                      No parcels found.
                    </td>
                  </tr>
                ) : (
                  filteredParcels.map((p) => {
                    const tracking = p.ParcelTrackingId || p.trackingId || p.trackingID;
                    const statusLower = (p.status ?? '').toLowerCase();

                    // Status color badge
                    const statusColor = {
                      received: 'bg-gray-600',
                      packed: 'bg-yellow-600',
                      shipped: 'bg-blue-600',
                      'out for delivery': 'bg-indigo-600',
                      delivered: 'bg-green-600',
                    }[statusLower] || 'bg-gray-600';

                    return (
                      <tr key={tracking} className="hover:bg-gray-800 transition">
                        <td className="p-3">{tracking}</td>
                        <td className="p-3">{p.recipientName || 'N/A'}</td>
                        <td className="p-3">{p.currentLocation || 'N/A'}</td>
                        <td className="p-3 text-center">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
                            {p.status || 'Unknown'}
                          </span>
                          <button
                            className="ml-2 bg-blue-700 hover:bg-blue-800 text-white px-2 py-1 rounded text-xs"
                            onClick={() => handleShowStatus(tracking)}
                            title="View Status Progress"
                          >
                            Show Status
                          </button>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            className="text-indigo-400 underline text-sm"
                            onClick={() => handleShowTimeline(tracking)}
                            title="View Timeline"
                          >
                            View Timeline
                          </button>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                            onClick={() => handleTamper(tracking)}
                            title="Raise Tamper Alert"
                          >
                            Raise Alert
                          </button>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleShowRoute(p.trackingId)}
                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                          >
                            View Route
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Status Modal */}
      {showStatusPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-8 rounded-xl max-w-3xl w-full">
            <h2 className="text-2xl font-bold mb-6 text-white">Status Progress for {currentTrackingId}</h2>
            <div className="flex justify-between items-center space-x-4">
              {statusFlow.map((status, index) => {
                const currentIndex = Math.max(
                  ...statusStages.map((s) => statusFlow.indexOf(s)).filter(i => i !== -1)
                );
                const isCompleted = index <= currentIndex;
                return (
                  <div key={index} className="flex flex-col items-center">
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center font-semibold text-lg ${
                        isCompleted ? 'bg-green-500 text-white shadow-lg' : 'bg-gray-700 text-gray-400'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <p className="mt-2 text-white text-center text-sm font-semibold">{status}</p>
                  </div>
                );
              })}
            </div>
            <button
              onClick={() => setShowStatusPopup(false)}
              className="mt-8 w-full py-3 rounded-md bg-red-600 hover:bg-red-700 text-white font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Timeline Modal */}
      {showTimeline && selectedTimeline && (
        <TimelineModal
          timeline={selectedTimeline}
          onClose={() => setShowTimeline(false)}
          handlersMap={handlersMap}
        />
      )}

      {showMap && routeData && (
       <RouteMap
         senderAddress={routeData.senderAddress}
         deliveryAddress={routeData.deliveryAddress}
         onClose={() => setShowMap(false)}
        />
       )}
      <Outlet />
    </div>
      </>
    );
  }

  if (userRole === 'sender') {
    return (
      <>
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-gray-300 p-8 font-sans">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-4xl font-extrabold text-white flex items-center space-x-3">
                  <FiPackage size={36} className="text-green-400" />
                  <span>Sender Dashboard</span>
                </h2>
                <DashboardHeader title="" />
              </div>
        
              {/* Summary Cards and Chart */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                <div className="bg-gray-800 rounded-xl p-6 shadow-lg flex items-center space-x-4 hover:shadow-green-500/50 transition-shadow">
                  <FiPackage size={36} className="text-green-400" />
                  <div>
                    <p className="text-sm uppercase tracking-wide text-green-300 font-semibold">Total Parcels</p>
                    <p className="text-3xl font-bold text-white">{myParcels.length}</p>
                  </div>
                </div>
        
                <div className="bg-gray-800 rounded-xl p-6 shadow-lg flex items-center space-x-4 hover:shadow-blue-400/60 transition-shadow">
                  <FiCheckCircle size={36} className="text-green-400" />
                  <div>
                    <p className="text-sm uppercase tracking-wide text-green-300 font-semibold">Delivered</p>
                    <p className="text-3xl font-bold text-green-400">{deliveredCount}</p>
                  </div>
                </div>
        
                <div className="bg-gray-800 rounded-xl p-6 shadow-lg flex items-center space-x-4 hover:shadow-yellow-400/70 transition-shadow">
                  <FiClock size={36} className="text-yellow-400" />
                  <div>
                    <p className="text-sm uppercase tracking-wide text-yellow-300 font-semibold">In Transit</p>
                    <p className="text-3xl font-bold text-yellow-400">{inTransitCount}</p>
                  </div>
                </div>
        
                <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
                  <Bar data={senderChartData} options={senderChartOptions} height={130} />
                </div>
              </div>
        
              {/* Create Parcel Form */}
        <div className="max-w-3xl mx-auto bg-gray-900 rounded-xl shadow-xl p-8 mb-12 border border-gray-700">
          <h3 className="text-2xl font-semibold mb-6 text-white">Create Parcel</h3>
          <div className="space-y-5">
            <input
              type="text"
              placeholder="Recipient Name"
              className="w-full rounded-lg bg-gray-800 border border-gray-700 p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              disabled={creatingParcel}
            />
            <input
              type="text"
              placeholder="Delivery Address"
              className="w-full rounded-lg bg-gray-800 border border-gray-700 p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              disabled={creatingParcel}
            />
        
            {/* New Fields Start */}
            <input
              type="text"
              placeholder="Sender Address"
              className="w-full rounded-lg bg-gray-800 border border-gray-700 p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
              value={senderAddress}
              onChange={(e) => setSenderAddress(e.target.value)}
              disabled={creatingParcel}
            />
        
            <select
              value={parcelCategory}
              onChange={(e) => setParcelCategory(e.target.value)}
              className="w-full rounded-lg bg-gray-800 border border-gray-700 p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
              disabled={creatingParcel}
            >
              <option value="">Select Parcel Category</option>
              <option value="Fragile">Fragile</option>
              <option value="Heavy">Heavy</option>
              <option value="Standard">Standard</option>
            </select>
        
            <input
              type="number"
              step="0.01"
              placeholder="Weight (kg)"
              className="w-full rounded-lg bg-gray-800 border border-gray-700 p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              disabled={creatingParcel}
            />
            {/* New Fields End */}
        
            <button
              onClick={handleCreate}
              disabled={creatingParcel}
              className="w-full bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-semibold py-3 rounded-lg shadow-md transition flex justify-center items-center space-x-2 disabled:opacity-50"
            >
              {creatingParcel ? (
                <svg
                  className="animate-spin h-6 w-6 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
              ) : null}
              <span>Create Parcel</span>
            </button>
            {result && (
              <div className="mt-6 bg-gray-800 rounded-lg p-5 border border-green-500 shadow-md flex items-center space-x-6">
                <div>
                  <p className="text-lg font-semibold text-green-400">Tracking ID:</p>
                  <p className="text-xl font-bold text-white">{result.trackingId}</p>
                </div>
                <img src={result.qrCode} alt="QR Code" className="w-32 h-32 rounded-md shadow-lg" />
              </div>
            )}
          </div>
        </div>
        
        
              {/* Parcels Table */}
        <div className="max-w-7xl mx-auto bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-700 overflow-x-auto">
          <h3 className="text-2xl font-bold mb-5 text-white flex items-center space-x-2">
            <FiPackage className="text-green-400" />
            <span>My Parcels</span>
          </h3>
          {loadingParcels ? (
            <div className="flex justify-center py-20">
              <svg
                className="animate-spin h-12 w-12 text-green-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
            </div>
          ) : (
            <table className="min-w-full border border-gray-700 text-sm text-gray-300 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-800 text-gray-200 uppercase text-xs select-none">
                  <th className="p-3 border border-gray-700">Tracking ID</th>
                  <th className="p-3 border border-gray-700">Recipient</th>
                  <th className="p-3 border border-gray-700">Delivery Address</th>
                  <th className="p-3 border border-gray-700">Sender Address</th>
                  <th className="p-3 border border-gray-700">Weight (kg)</th>
                  <th className="p-3 border border-gray-700">Parcel Type</th>
                  <th className="p-3 border border-gray-700">Status</th>
                  <th className="p-3 border border-gray-700">Timeline</th>
                  <th className="p-3 border border-gray-700">Route</th>
                  <th className="p-3 border border-gray-700">Parrcel QR Code</th>
                </tr>
              </thead>
              <tbody>
                {myParcels.map((p) => (
                  <tr
                    key={p.trackingId}
                    className="hover:bg-gray-800 cursor-pointer transition-colors"
                    title="Click buttons to view status or timeline"
                  >
                    <td className="p-3 border border-gray-700 font-mono text-xs">{p.trackingId}</td>
                    <td className="p-3 border border-gray-700">{p.recipientName}</td>
                    <td className="p-3 border border-gray-700">{p.deliveryAddress}</td>
                    <td className="p-3 border border-gray-700">{p.senderAddress}</td>
                    <td className="p-3 border border-gray-700">{p.weight}</td>
                    <td className="p-3 border border-gray-700">{p.parcelCategory}</td>
                    <td className="p-3 border border-gray-700">
                      <button
                       onClick={() => handleShowStatus(p.trackingId)}
                       className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-green-400 to-blue-600 group-hover:from-green-400 group-hover:to-blue-600 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800"
                      >
                      <span className="relative px-4 py-2 flex items-center space-x-1 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent">
                          <FiAlertCircle size={18} />
                       <span>Show Status</span>
                      </span>
                      </button>
                    </td>
                    <td className="p-3 border border-gray-700 flex items-center justify-center">
                       <button 
                          onClick={() => handleShowTimeline(p.trackingId)}
                         class="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-teal-300 to-lime-300 group-hover:from-teal-300 group-hover:to-lime-300 dark:text-white dark:hover:text-gray-900 focus:ring-4 focus:outline-none focus:ring-lime-200 dark:focus:ring-lime-800">
                         <span class="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent">
                           View Timeline
                         </span>
                       </button>
                    </td>
                    <td className="p-3 border border-gray-700 text-centre">
                      <button 
                        onClick={() => handleShowRoute(p.trackingId)}
                        class="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800">
                        <span class="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent">
                           View Route
                        </span>
                      </button>
                        </td>
                        <td className="p-3 border border-gray-700 flex items-center justify-center">
                          <button 
                           onClick={() => openQRCodeModal(p.trackingId)}
                           class="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-pink-500 to-orange-400 group-hover:from-pink-500 group-hover:to-orange-400 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-pink-200 dark:focus:ring-pink-800">
                             <span class="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent">
                               Show QR Code
                             </span>
                          </button>
                        </td>
                  </tr>
                ))}
                {myParcels.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center p-6 text-gray-500 italic">
                      No parcels found. Create one above!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        
        {showStatusPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-gray-900 p-6 rounded-xl text-white w-full max-w-2xl">
              <h2 className="text-xl font-bold mb-4">Status Progress for {currentTrackingId}</h2>
              <div className="flex justify-between items-center space-x-2">
                {(() => {
                  const highestStageIndex = Math.max(
                    ...statusStages.map((s) => statusList.indexOf(s)).filter(i => i >= 0),
                    -1
                  );
                  return statusList.map((status, index) => {
                    const isCompleted = index <= highestStageIndex;
                    return (
                      <div key={index} className="flex flex-col items-center">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold ${
                            isCompleted ? 'bg-green-500' : 'bg-gray-500'
                          }`}
                        >
                          {index + 1}
                        </div>
                        <p className="text-xs mt-1 text-center">{status}</p>
                      </div>
                    );
                  });
                })()}
              </div>
              <button
                onClick={() => setShowStatusPopup(false)}
                className="mt-6 bg-red-600 text-white px-4 py-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        )}        
              {/* Timeline Modal */}
              {showTimeline && selectedTimeline && (
                <TimelineModal
                  timeline={selectedTimeline}
                  onClose={() => setShowTimeline(false)}
                />
              )}
              {showMap && routeData && (
                <RouteMap
                 senderAddress={routeData.senderAddress}
                 deliveryAddress={routeData.deliveryAddress}
                 onClose={() => setShowMap(false)}
                />
              )}
              {showQrModal && (
                 <QRCodeModal qrCode={qrCode} onClose={closeQRCodeModal} />
                )}
            </div>
      </>
    );
  }
  return <div>Unauthorized or unknown role</div>;
}
