import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { X, Users, Utensils, Trash2 } from 'lucide-react';
import { RSVPResponse } from '../../types';

interface DashboardProps {
  onClose: () => void;
}

const COLORS = ['#b89c8e', '#e5d1c8', '#8c8581', '#f0eae5'];

const Dashboard: React.FC<DashboardProps> = ({ onClose }) => {
  const [responses, setResponses] = useState<RSVPResponse[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('wedding_rsvp_responses');
    if (saved) {
      setResponses(JSON.parse(saved));
    }
  }, []);

  const handleClear = () => {
    if (window.confirm('모든 응답 데이터를 삭제하시겠습니까?')) {
      localStorage.removeItem('wedding_rsvp_responses');
      setResponses([]);
    }
  };

  const totalGuests = responses.reduce((acc, curr) => acc + curr.totalGuests, 0);
  const groomGuests = responses.filter(r => r.relation === 'groom').reduce((acc, curr) => acc + curr.totalGuests, 0);
  const brideGuests = responses.filter(r => r.relation === 'bride').reduce((acc, curr) => acc + curr.totalGuests, 0);
  const mealCount = responses.filter(r => r.wantsMeal).reduce((acc, curr) => acc + curr.totalGuests, 0);

  const relationData = [
    { name: '신랑측', value: groomGuests },
    { name: '신부측', value: brideGuests },
  ];

  const mealData = [
    { name: '식사함', value: mealCount },
    { name: '안함', value: totalGuests - mealCount },
  ];

  return (
    <div className="dashboard-overlay">
      <div className="dashboard-modal">
        <header className="dashboard-header">
          <div className="header-title">
            <h2>📊 하객 응답 분석 리포트</h2>
            <p>실시간으로 수집된 하객 데이터를 시각화하여 보여줍니다.</p>
          </div>
          <div className="header-actions">
            <button className="clear-btn" onClick={handleClear} title="데이터 초기화"><Trash2 size={20} /></button>
            <button className="close-btn" onClick={onClose}><X size={24} /></button>
          </div>
        </header>

        <div className="stats-grid">
          <div className="stat-card">
            <Users size={20} color="#b89c8e" />
            <div className="stat-info">
              <span>총 참석 인원</span>
              <strong>{totalGuests}명</strong>
            </div>
          </div>
          <div className="stat-card">
            <Utensils size={20} color="#b89c8e" />
            <div className="stat-info">
              <span>총 식사 인원</span>
              <strong>{mealCount}명</strong>
            </div>
          </div>
        </div>

        {responses.length > 0 ? (
          <>
            <div className="charts-grid">
              <div className="chart-card">
                <h3>측별 참석 비중</h3>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={relationData}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {relationData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="chart-card">
                <h3>식사 여부 통계</h3>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={mealData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#e5d1c8" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="list-card">
              <h3>하객 응답 리스트</h3>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>구분</th>
                      <th>이름</th>
                      <th>인원</th>
                      <th>식사</th>
                      <th>메시지</th>
                    </tr>
                  </thead>
                  <tbody>
                    {responses.map((res, i) => (
                      <tr key={i}>
                        <td><span className={`tag ${res.relation}`}>{res.relation === 'groom' ? '신랑측' : '신부측'}</span></td>
                        <td>{res.guestName}</td>
                        <td>{res.totalGuests}명</td>
                        <td>{res.wantsMeal ? 'O' : 'X'}</td>
                        <td className="msg-td">{res.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="no-data">
            <p>아직 수집된 응답 데이터가 없습니다.</p>
          </div>
        )}
      </div>

      <style>{`
        .dashboard-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(74, 69, 67, 0.6);
          backdrop-filter: blur(5px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          padding: 20px;
        }
        .dashboard-modal {
          width: 100%;
          max-width: 900px;
          max-height: 90vh;
          background: #fdfbf9;
          border-radius: 30px;
          padding: 40px;
          overflow-y: auto;
          box-shadow: 0 50px 100px rgba(0,0,0,0.3);
        }
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 40px;
        }
        .header-title h2 { margin: 0 0 8px 0; color: #b89c8e; font-size: 1.8rem; text-align: left; }
        .header-title p { margin: 0; color: #8c8581; font-size: 0.95rem; }
        .header-actions { display: flex; gap: 10px; }
        .close-btn, .clear-btn { color: #8c8581; padding: 10px; border-radius: 50%; transition: background 0.2s; border: none; background: transparent; cursor: pointer; }
        .close-btn:hover, .clear-btn:hover { background: #f0eae5; }
        .clear-btn:hover { color: #e74c3c; }

        .stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 30px;
        }
        .stat-card {
          background: white;
          padding: 24px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 15px;
          border: 1px solid #f0eae5;
        }
        .stat-info span { font-size: 0.85rem; color: #8c8581; display: block; }
        .stat-info strong { font-size: 1.5rem; color: #4a4543; }

        .charts-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 30px;
        }
        .chart-card {
          background: white;
          padding: 24px;
          border-radius: 20px;
          border: 1px solid #f0eae5;
        }
        .chart-card h3 { font-size: 1rem; color: #b89c8e; margin: 0 0 20px 0; font-weight: 600; }

        .list-card {
          background: white;
          padding: 24px;
          border-radius: 20px;
          border: 1px solid #f0eae5;
        }
        .list-card h3 { font-size: 1rem; color: #b89c8e; margin: 0 0 20px 0; font-weight: 600; }
        
        .table-wrapper { overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
        th { text-align: left; padding: 12px; border-bottom: 2px solid #f7f3f0; color: #8c8581; }
        td { padding: 12px; border-bottom: 1px solid #f7f3f0; color: #4a4543; }
        .tag { padding: 4px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: 700; }
        .tag.groom { background: #e5d1c8; color: #fff; }
        .tag.bride { background: #b89c8e; color: #fff; }
        .msg-td { font-style: italic; color: #8c8581; font-size: 0.85rem; }

        .no-data {
          padding: 60px;
          text-align: center;
          color: #8c8581;
          background: white;
          border-radius: 20px;
          border: 1px dashed #f0eae5;
        }

        @media (max-width: 700px) {
          .stats-grid, .charts-grid { grid-template-columns: 1fr; }
          .dashboard-modal { padding: 20px; }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
