#!/bin/bash

# ===================================
# Git Change Tracker - ระบบติดตามการเปลี่ยนแปลง
# สำหรับให้ทั้งคุณและผมตรวจสอบได้
# ===================================

echo "🔍 === Git Change Tracker ==="
echo "⏰ วันที่ตรวจสอบ: $(date)"
echo "📍 โฟลเดอร์: $(pwd)"
echo ""

# 1. สถานะปัจจุบัน
echo "📊 === สถานะ Git ปัจจุบัน ==="
git status --porcelain
echo ""

# 2. ประวัติการ commit ล่าสุด
echo "📝 === ประวัติ Commit ล่าสุด (5 อันดับ) ==="
git log --oneline -5
echo ""

# 3. ไฟล์ที่ถูกเปลี่ยนแปลง
echo "📁 === รายละเอียดการเปลี่ยนแปลง ==="
git diff --name-status
echo ""

# 4. สถิติการเปลี่ยนแปลง
echo "📈 === สถิติการเปลี่ยนแปลง ==="
echo "จำนวนไฟล์ที่ถูกแก้ไข: $(git diff --name-only | wc -l)"
echo "จำนวนไฟล์ที่ถูกลบ: $(git diff --name-status | grep '^D' | wc -l)"
echo "จำนวนไฟล์ใหม่: $(git ls-files --others --exclude-standard | wc -l)"
echo ""

# 5. เปรียบเทียบกับ commit ก่อนหน้า
echo "🔄 === เปรียบเทียบกับ commit ก่อนหน้า ==="
git diff HEAD~1 --stat
echo ""

# 6. ตรวจสอบไฟล์สำคัญ
echo "⚠️ === ตรวจสอบไฟล์สำคัญ ==="
important_files=("main1.html" "main1-svg.html" "complete-page1.svg" "complete-page2.svg" "combined-data.json")

for file in "${important_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file มีอยู่"
    else
        echo "❌ $file ไม่พบ"
    fi
done

echo ""
echo "💡 === คำแนะนำ ==="
echo "• ใช้ 'git log --oneline -10' เพื่อดูประวัติ commit"
echo "• ใช้ 'git diff <filename>' เพื่อดูการเปลี่ยนแปลงในไฟล์"
echo "• ใช้ 'git show <commit-hash>' เพื่อดูรายละเอียด commit"
echo "• ใช้ 'git checkout <commit-hash> -- <filename>' เพื่อคืนไฟล์"
echo ""

echo "🎯 === สรุปสถานการณ์ ==="
if [ $(git diff --name-only | wc -l) -gt 0 ]; then
    echo "⚠️ มีการเปลี่ยนแปลงที่ยังไม่ได้ commit"
    echo "📝 แนะนำให้ commit ก่อนทำงานต่อ"
else
    echo "✅ ไม่มีการเปลี่ยนแปลงที่รอ commit"
fi