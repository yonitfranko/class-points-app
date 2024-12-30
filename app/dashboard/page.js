'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const getPrizeName = (points) => {
  const prizeList = [
    { name: 'שעת יצירה', points: 50 },
    { name: 'זמן משחק כיתתי', points: 60 },
    { name: 'זמן מחשבים', points: 70 },
    { name: 'סרט עם פופקורן', points: 80 },
    { name: 'הורה מפעיל', points: 90 },
    { name: 'שיעור לבחירה', points: 100 },
    { name: 'פעילות עם הורים', points: 150 },
    { name: 'שיעור חופשי', points: 200 },
    { name: 'ארטיק/שלוק/גלידה', points: 250 },
    { name: 'העברת פעילות לכיתה אחרת', points: 300 },
    { name: 'ארוחה כיתתית בחצר ביה"ס', points: 350 },
    { name: 'יום ישיבה חופשית', points: 400 },
    { name: 'למידה מחוץ לכיתה', points: 450 },
    { name: 'משחק קופסה לכיתה', points: 500 },
    { name: 'יום ללא תיק', points: 600 },
    { name: 'סרט במדיה טק', points: 700 },
    { name: 'פעילות גיבוש כיתתית', points: 800 },
    { name: 'פעילות באולינג', points: 900 },
    { name: 'פארק חבלים', points: 1000 }
  ];

  const prize = prizeList.find(p => p.points === points);
  return prize ? prize.name : `פרס (${points} נקודות)`;
};

const Dashboard = () => {
  const [classesData, setClassesData] = useState([]);
  const [prizesHistory, setPrizesHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // מביא את כל הנתונים
      const [pointsResult, prizesResult] = await Promise.all([
        supabase
          .from('class_points')
          .select('*')
          .order('created_at', { ascending: true }),
        supabase
          .from('class_points')
          .select('*')
          .lt('points', 0)
          .order('created_at', { ascending: false })
          .limit(10)
      ]);

      if (pointsResult.error) throw pointsResult.error;
      if (prizesResult.error) throw prizesResult.error;

      const points = pointsResult.data;

      // מיפוי נתונים לכל כיתה בנפרד
      const classData = {};
      const allDates = new Set();

      points.forEach(record => {
        const date = new Date(record.created_at).toLocaleDateString('en-GB', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
        
        allDates.add(date);

        if (!classData[record.class_name]) {
          classData[record.class_name] = {
            running_total: 0,
            points: {}
          };
        }

        classData[record.class_name].running_total += record.points;
        classData[record.class_name].points[date] = classData[record.class_name].running_total;
      });

      // יצירת מערך נתונים לגרף
      const chartData = Array.from(allDates).map(date => {
        const dataPoint = { date };
        Object.keys(classData).forEach(className => {
          dataPoint[className] = classData[className].points[date] || dataPoint[className];
        });
        return dataPoint;
      });

      // מיון כיתות לפי סך הנקודות
      const rankings = Object.entries(classData)
        .map(([name, data]) => ({
          name,
          total: data.running_total
        }))
        .sort((a, b) => b.total - a.total);

      // עיבוד היסטוריית הפרסים
      const prizeHistory = prizesResult.data.map(record => ({
        className: record.class_name,
        points: Math.abs(record.points),
        date: new Date(record.created_at).toLocaleDateString('en-GB', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        })
      }));

      setClassesData({
        timeline: chartData,
        rankings,
        classes: Object.keys(classData)
      });
      setPrizesHistory(prizeHistory);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4">טוען נתונים...</div>;

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* טבלת דירוג */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-bold mb-4">דירוג כיתות</h2>
          <div className="overflow-y-auto max-h-96">
            {classesData.rankings.map((classInfo, index) => (
              <div 
                key={classInfo.name}
                className="flex justify-between items-center p-2 bg-gray-50 rounded mb-2"
              >
                <span>{index + 1}. {classInfo.name}</span>
                <span>{classInfo.total} נקודות</span>
              </div>
            ))}
          </div>
        </div>

        {/* גרף התקדמות */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-bold mb-4">התקדמות לאורך זמן</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={classesData.timeline}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              {classesData.classes.map((className, index) => (
                <Line
                  key={className}
                  type="monotone"
                  dataKey={className}
                  name={`כיתה ${className}`}
                  stroke={`hsl(${(index * 360) / classesData.classes.length}, 70%, 50%)`}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* היסטוריית פרסים */}
        <div className="col-span-2 bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-bold mb-4">היסטוריית פרסים אחרונה</h2>
          <div className="overflow-y-auto max-h-96">
            {prizesHistory.length > 0 ? (
              <div className="space-y-2">
                {prizesHistory.map((prize, index) => (
                  <div 
                    key={index}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded"
                  >
                    <div>
                      <span className="font-bold">כיתה {prize.className}</span>
                      <span className="mx-2">-</span>
                      <span>{getPrizeName(prize.points)}</span>
                    </div>
                    <div className="text-gray-600">{prize.date}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500">
                עוד לא נבחרו פרסים
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
