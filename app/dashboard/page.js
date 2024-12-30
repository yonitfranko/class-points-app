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

      // עיבוד הנתונים
      const classesTotals = {};
      const timelineData = [];

      points.forEach(record => {
        const date = new Date(record.created_at).toLocaleDateString();
        
        if (!classesTotals[record.class_name]) {
          classesTotals[record.class_name] = 0;
        }
        classesTotals[record.class_name] += record.points;
        
        timelineData.push({
          date,
          className: record.class_name,
          total: classesTotals[record.class_name]
        });
      });

      // מיון הכיתות לפי סך הנקודות
      const sortedClasses = Object.entries(classesTotals)
        .map(([name, total]) => ({ name, total }))
        .sort((a, b) => b.total - a.total);

      setClassesData({
        timeline: timelineData,
        rankings: sortedClasses
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
              <Line type="monotone" dataKey="total" name="ניקוד כולל" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
