'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [classesData, setClassesData] = useState([]);
  const [prizesHistory, setPrizesHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

const fetchData = async () => {
  try {
    const { data: points, error } = await supabase
      .from('class_points')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;

    // מיפוי נתונים לכל כיתה בנפרד
    const classData = {};
    const allDates = new Set();

    points.forEach(record => {
      const date = new Date(record.created_at).toLocaleDateString('he-IL', {
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

    setClassesData({
      timeline: chartData,
      rankings,
      classes: Object.keys(classData)
    });
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
      </div>
    </div>
  );
};

export default Dashboard;
