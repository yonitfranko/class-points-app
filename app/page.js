'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import Link from 'next/link';

const Logo = () => (
  <div className="text-center bg-white rounded-lg shadow p-4 mb-6">
    <div className="mb-4">
      <img 
        src="/logo.PNG"
        alt="סמל בית ספר כצנלסון"
        style={{ height: '128px', margin: '0 auto', display: 'block' }}
      />
    </div>
    <h1 className="text-2xl font-bold text-blue-600">בנק אוצר המילים של כצנלסון</h1>
    <div className="text-lg">בית ספר כצנלסון</div>
    <div className="mt-4">
      <Link href="/dashboard">
        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          דשבורד מנהלת
        </button>
      </Link>
    </div>
  </div>
);

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
