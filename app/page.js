'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';

const ClassPointsApp = () => {
  // Initial data
  const grades = ['א', 'ב', 'ג', 'ד', 'ה', 'ו'];
  const classStructure = {
    'א': ['1', '2', '3'],
    'ב': ['1', '2', '3', '4', '5'],
    'ג': ['1', '2', '3'],
    'ד': ['1', '2', '3'],
    'ה': ['1', '2', '3'],
    'ו': ['1', '2', '3', '4']
  };
  
  const prizes = [
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

  // State
  const [selectedGrade, setSelectedGrade] = useState(grades[0]);
  const [selectedNumber, setSelectedNumber] = useState(classStructure[grades[0]][0]);
  const [questionScores, setQuestionScores] = useState(Array(10).fill(0));
  const [classPoints, setClassPoints] = useState({});
  const [loading, setLoading] = useState(true);

  // Get current class name
  const currentClass = `${selectedGrade}${selectedNumber}`;

  // Load points from Supabase
  useEffect(() => {
    fetchPoints();
  }, []);

  const fetchPoints = async () => {
    try {
      const { data, error } = await supabase
        .from('class_points')
        .select('*');

      if (error) throw error;

      // Convert array of records to object
      const pointsObject = {};
      data.forEach(record => {
        if (!pointsObject[record.class_name]) {
          pointsObject[record.class_name] = 0;
        }
        pointsObject[record.class_name] += record.points;
      });

      setClassPoints(pointsObject);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching points:', error);
      setLoading(false);
    }
  };

  // Handle grade change
  const handleGradeChange = (grade) => {
    setSelectedGrade(grade);
    setSelectedNumber(classStructure[grade][0]);
  };

  // Get total points for current class
  const getCurrentClassPoints = () => classPoints[currentClass] || 0;
  
  // Calculate total score for current submission
  const getCurrentSubmissionTotal = () => questionScores.reduce((sum, score) => sum + score, 0);

  // Submit scores
  const submitScores = async () => {
    const totalNew = getCurrentSubmissionTotal();
    if (totalNew === 0) return;

    try {
      const { error } = await supabase
        .from('class_points')
        .insert([
          { class_name: currentClass, points: totalNew }
        ]);

      if (error) throw error;

      setClassPoints(prev => ({
        ...prev,
        [currentClass]: (prev[currentClass] || 0) + totalNew
      }));

      setQuestionScores(Array(10).fill(0));
    } catch (error) {
      console.error('Error submitting scores:', error);
      alert('שגיאה בשמירת הניקוד. נסו שוב.');
    }
  };

  // Update individual question score
  const updateQuestionScore = (index, score) => {
    const newScores = [...questionScores];
    newScores[index] = score;
    setQuestionScores(newScores);
  };

  // Redeem prize
  const redeemPrize = async (prize) => {
    if (getCurrentClassPoints() >= prize.points) {
      try {
        const { error } = await supabase
          .from('class_points')
          .insert([
            { class_name: currentClass, points: -prize.points }
          ]);

        if (error) throw error;

        setClassPoints(prev => ({
          ...prev,
          [currentClass]: prev[currentClass] - prize.points
        }));
      } catch (error) {
        console.error('Error redeeming prize:', error);
        alert('שגיאה בבחירת הפרס. נסו שוב.');
      }
    }
  };

  if (loading) {
    return <div className="p-4">טוען נתונים...</div>;
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* Class Selection */}
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-bold mb-4">בחירת כיתה</h2>
        <div className="flex gap-4 items-center">
          <select 
            value={selectedGrade}
            onChange={(e) => handleGradeChange(e.target.value)}
            className="p-2 border rounded"
          >
            {grades.map(grade => (
              <option key={grade} value={grade}>שכבה {grade}</option>
            ))}
          </select>
          
          <select 
            value={selectedNumber}
            onChange={(e) => setSelectedNumber(e.target.value)}
            className="p-2 border rounded"
          >
            {classStructure[selectedGrade].map(num => (
              <option key={num} value={num}>כיתה {num}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Questions Scoring */}
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-bold mb-4">ניקוד שאלות - {currentClass}</h2>
        <div className="grid grid-cols-2 gap-4">
          {questionScores.map((score, index) => (
            <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
              <span>שאלה {index + 1}:</span>
              <select 
                value={score}
                onChange={(e) => updateQuestionScore(index, Number(e.target.value))}
                className="p-1 border rounded"
              >
                <option value={0}>0 נקודות</option>
                <option value={5}>5 נקודות</option>
                <option value={10}>10 נקודות</option>
              </select>
            </div>
          ))}
        </div>
        
        <div className="mt-4 flex justify-between items-center">
          <div>סה"כ ניקוד: {getCurrentSubmissionTotal()} נקודות</div>
          <button 
            onClick={submitScores}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            שמור ניקוד
          </button>
        </div>
      </div>

      {/* Class Total and Prizes */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-bold mb-4">סה"כ נקודות ופרסים - {currentClass}</h2>
        <div className="mb-4 text-lg font-bold">
          יתרת נקודות: {getCurrentClassPoints()}
        </div>
        
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {prizes.map((prize) => (
            <div key={prize.name} className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span>{prize.name} ({prize.points} נקודות)</span>
              <button
                onClick={() => redeemPrize(prize)}
                disabled={getCurrentClassPoints() < prize.points}
                className={`px-4 py-2 rounded ${
                  getCurrentClassPoints() >= prize.points
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                בחר פרס
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClassPointsApp;
 
