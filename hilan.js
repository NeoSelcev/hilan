(
    function () {
        'use strict';

        function showMenu() {

            // Remove existing menu if present
            var oldMenu = document.getElementById('hilan-float-menu');
            if (oldMenu) oldMenu.remove();

            // Create floating menu container
            var menu = document.createElement('div');
            menu.id = 'hilan-float-menu';
            menu.style.position = 'fixed';
            menu.style.top = '32px';
            menu.style.right = '32px';
            menu.style.background = 'rgba(30, 34, 44, 0.85)';
            menu.style.backdropFilter = 'blur(12px)';
            menu.style.border = '1.5px solid rgba(80, 120, 255, 0.25)';
            menu.style.borderRadius = '18px';
            menu.style.boxShadow = '0 8px 32px 0 rgba(31, 38, 135, 0.25)';
            menu.style.padding = '26px 28px 20px 28px';
            menu.style.zIndex = 99999;
            menu.style.fontFamily = 'Segoe UI, Arial, sans-serif';
            menu.style.minWidth = '250px';
            menu.style.color = '#f3f6fa';
            menu.style.transition = 'all 0.2s cubic-bezier(.4,0,.2,1)';

            // Title
            var title = document.createElement('div');
            title.textContent = 'Hilan Menu';
            title.style.fontWeight = 'bold';
            title.style.fontSize = '22px';  
            title.style.marginBottom = '16px';
            title.style.letterSpacing = '0.5px';
            title.style.color = '#7bb6ff';
            title.style.textShadow = '0 2px 8px rgba(80,120,255,0.10)';
            menu.appendChild(title);

            function addButton(text, onClick, closeMenu = true) {
                var btn = document.createElement('button');
                btn.textContent = text;
                btn.style.display = 'block';
                btn.style.width = '100%';
                btn.style.margin = '10px 0';
                btn.style.padding = '12px 0';
                btn.style.fontSize = '16px';
                btn.style.background = 'linear-gradient(90deg, #4f8cff 0%, #7bb6ff 100%)';
                btn.style.color = '#fff';
                btn.style.border = 'none';
                btn.style.borderRadius = '8px';
                btn.style.cursor = 'pointer';
                btn.style.fontWeight = '600';
                btn.style.boxShadow = '0 2px 8px rgba(80,120,255,0.10)';
                btn.style.transition = 'background 0.18s cubic-bezier(.4,0,.2,1), transform 0.12s';
                btn.onmouseover = function () {
                    btn.style.background = 'linear-gradient(90deg, #7bb6ff 0%, #4f8cff 100%)';
                    btn.style.transform = 'scale(1.03)';
                };
                btn.onmouseout = function () {
                    btn.style.background = 'linear-gradient(90deg, #4f8cff 0%, #7bb6ff 100%)';
                    btn.style.transform = 'scale(1)';
                };
                btn.onclick = function (e) {
                    e.preventDefault();
                    onClick();
                    if (closeMenu) menu.remove();
                };
                menu.appendChild(btn);
            }

            addButton('Go to Max Hilan - Add daily hours', function () {
                var url = 'https://leumicard-sso.net.hilan.co.il/Hilannetv2/Attendance/calendarpage.aspx';
                var urlHost = new URL(url).hostname;
                var currentHost = window.location.hostname;
                if (urlHost !== currentHost) {
                    window.open(url, '_blank');
                } else {
                    window.location.href = url;
                }
            }, true);
            addButton('Go to Max Hilan - Download report', function () {
                var url = 'https://leumicard-sso.net.hilan.co.il/Hilannetv2/Attendance/AttendanceApproval.aspx';
                var urlHost = new URL(url).hostname;
                var currentHost = window.location.hostname;
                if (urlHost !== currentHost) {
                    window.open(url, '_blank');
                } else {
                    window.location.href = url;
                }
            }, true);
            addButton('Go to Matrix Hilan', function () {
                var url = 'https://matrix.net.hilan.co.il/Hilannetv2/Attendance/calendarpage.aspx?itemId=47';
                var urlHost = new URL(url).hostname;
                var currentHost = window.location.hostname;
                if (urlHost !== currentHost) {
                    window.open(url, '_blank');
                } else {
                    window.location.href = url;
                }
            }, true);
            addButton('Select the Month', function () {
                selectMonth();
            }, true);
            addButton('Upload Report and Do the Magic', function () {
                doMagic();
            }, true);


            // Close button
            var closeBtn = document.createElement('span');
            closeBtn.textContent = '×';
            closeBtn.title = 'Close';
            closeBtn.style.position = 'absolute';
            closeBtn.style.top = '12px';
            closeBtn.style.right = '18px';
            closeBtn.style.cursor = 'pointer';
            closeBtn.style.fontSize = '26px';
            closeBtn.style.color = '#7bb6ff';
            closeBtn.style.fontWeight = 'bold';
            closeBtn.style.textShadow = '0 2px 8px rgba(80,120,255,0.15)';
            closeBtn.onmouseover = function () { closeBtn.style.color = '#fff'; };
            closeBtn.onmouseout = function () { closeBtn.style.color = '#7bb6ff'; };
            closeBtn.onclick = function () { menu.remove(); };
            menu.appendChild(closeBtn);

            document.body.appendChild(menu);
        }

        function selectMonth() {
            // First select all days
            document.querySelectorAll('#calendar_container > tbody > tr > td:nth-child(-n+6).cDIES[ondblclick]:not([title*=":"]):not([title*="."]):not([title*=","]):not([title*=" - "])').forEach(e => e.click());

            // Set up observer for the XSRF token element
            const tokenInput = document.querySelector('#H-XSRF-Token');
            if (!tokenInput) {
                document.querySelector('#ctl00_mp_RefreshSelectedDays').click();
                setTimeout(() => {
                    alert('Month selection completed. You can now upload a report.');
                }, 1000);
                return;
            }

            const observer = new MutationObserver((mutations, obs) => {
                mutations.forEach(mutation => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'tabindex') {
                        const tabindex = tokenInput.getAttribute('tabindex');
                        if (tabindex === '0') {
                            // Form is ready again
                            obs.disconnect();
                            alert('Month selection completed. You can now upload a report.');
                        }
                    }
                });
            });

            // Start observing the token input for tabindex changes
            observer.observe(tokenInput, {
                attributes: true,
                attributeFilter: ['tabindex']
            });

            // Now trigger the refresh
            document.querySelector('#ctl00_mp_RefreshSelectedDays').click();
        }

        function selectMonthAndUpload() {
            // First select all days
            document.querySelectorAll('#calendar_container > tbody > tr > td:nth-child(-n+6).cDIES[ondblclick]:not([title*=":"]):not([title*="."]):not([title*=","]):not([title*=" - "])').forEach(e => e.click());

            // Set up observer for the XSRF token element
            const tokenInput = document.querySelector('#H-XSRF-Token');
            if (!tokenInput) {
                document.querySelector('#ctl00_mp_RefreshSelectedDays').click();
                setTimeout(() => {
                    Warning('Automation failed: upload the file manually');
                }, 1000);
                return;
            }

            const observer = new MutationObserver((mutations, obs) => {
                mutations.forEach(mutation => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'tabindex') {
                        const tabindex = tokenInput.getAttribute('tabindex');
                        if (tabindex === '0') {
                            // Form is ready again
                            obs.disconnect();
                            // Start the upload process
                            doMagic();
                        }
                    }
                });
            });

            // Start observing the token input for tabindex changes
            observer.observe(tokenInput, {
                attributes: true,
                attributeFilter: ['tabindex']
            });

            // Now trigger the refresh
            document.querySelector('#ctl00_mp_RefreshSelectedDays').click();
        }

        function doMagic() {
            // Start the chain by uploading file
            uploadFile(function (file) {
                if (file) {
                    readFile(file, function (text) {
                        if (text) {
                            var reports = parseText(text); // Parse the report content
                            if (reports) {
                                console.dir(reports); // Output filtered report data to console for debugging
                                fillReport(reports); // Fill the form with filtered data
                            }
                        }
                    });
                }
            });
        }

        function uploadFile(callback) {
            // Create a hidden file input for uploading report files
            var input = document.createElement('input');
            input.type = 'file';
            input.accept = '.xls,.xlsx,.html,.htm'; // Accept common report formats
            input.onchange = e => {
                var file = e.target.files[0];
                if (!file) {
                    alert('No file selected.');
                }
                callback(file); // Execute callback with the file object
            }
            input.click(); // Trigger file selection dialog
        }

        function readFile(file, callback) {
            // Read the uploaded file as text
            let reader = new FileReader();
            reader.onload = function (event) {
                var reportText = event.target.result;
                // Basic validation for file content
                if (!reportText || reportText.length < 100) {
                    alert('File appears empty or invalid.');
                    return reportText;
                }
                callback(reportText); // Execute callback with the file content
            };
            reader.onerror = function () {
                alert('Error reading file.');
                callback(null); // Execute callback with null on error
            };
            reader.readAsText(file);
        }

        function parseText(text) {
            // Parse the uploaded report text into an HTML element
            var reportElement = document.createElement('html');
            try {
                reportElement.innerHTML = text;
                // Extract and process report data
                // Extract and filter report data from the parsed HTML
                // Defensive: check for table rows
                var daysRows = reportElement.querySelectorAll('body > div > table > tbody > tr:has(td)');
                if (!daysRows || daysRows.length === 0) {
                    alert('No valid rows found in report.');
                    return;
                }
                // Filter rows for working days (empty or specific text in 8th column)
                var woringDaysRows = Array.prototype.slice.call(daysRows).filter(e => {
                    try {
                        return e.querySelector('td:nth-child(8)').innerText === ''
                            || e.querySelector('td:nth-child(8)').innerText === 'עבודה מהבית /מחוץ למשרד'
                            || e.querySelector('td:nth-child(8)').innerText === 'תקלה טכנית'
                            || e.querySelector('td:nth-child(8)').innerText === 'החתמה כפולה';
                    } catch (err) {
                        return false;
                    }
                });
                if (woringDaysRows.length === 0) {
                    alert('No working days found in report.');
                    return;
                }
                // Map report data by date
                var reportsMap = {};
                woringDaysRows.forEach((woringDayRow) => {
                    try {
                        var dateMatch = woringDayRow.querySelector('td:nth-child(1)').innerText.match(/\d+\/\d+(\/\d+)?/);
                        if (!dateMatch) return;
                        var date = dateMatch[0].substring(0, 5);
                        var start = woringDayRow.querySelector('td:nth-child(5)').innerText;
                        var end = woringDayRow.querySelector('td:nth-child(6)').innerText;
                        var duration = woringDayRow.querySelector('td:nth-child(7)') ? woringDayRow.querySelector('td:nth-child(7)').innerText : '';
                        if (!reportsMap[date]) reportsMap[date] = { periods: [], durations: [] };
                        reportsMap[date].periods.push({ start, end });
                        if (duration) reportsMap[date].durations.push(duration);
                    } catch (err) {
                        // skip malformed row
                    }
                });
                // Filter periods according to all rules
                var reports = [];
                for (const [date, { periods, durations }] of Object.entries(reportsMap)) {
                    const filteredPeriods = periods.filter((p, idx, arr) => {
                        // Rule 1: Exclude periods where start is '00:00' and end matches any duration
                        if (p.start === '00:00' && durations.includes(p.end)) {
                            return false;
                        }
                        // Rule 2: Exclude periods where both start and end match any duration
                        if (durations.includes(p.start) && durations.includes(p.end)) {
                            return false;
                        }
                        // Rule 3: Exclude periods where start matches duration of a previous period and end matches sum of durations from first up to that previous period plus the next
                        for (let i = 0; i < idx; i++) {
                            if (p.start === durations[i]) {
                                let totalMinutes = 0;
                                for (let j = 0; j <= i; j++) {
                                    const dur = durations[j];
                                    if (dur && dur.includes(':')) {
                                        const [h, m] = dur.split(':').map(Number);
                                        totalMinutes += h * 60 + m;
                                    }
                                }
                                if (durations[i + 1] && durations[i + 1].includes(':')) {
                                    const [h, m] = durations[i + 1].split(':').map(Number);
                                    totalMinutes += h * 60 + m;
                                }
                                const sumH = Math.floor(totalMinutes / 60);
                                // Avoid using modulo: sumM = totalMinutes - (sumH * 60)
                                const sumM = totalMinutes - (sumH * 60);
                                const sum = sumH.toString().padStart(2, '0') + ':' + sumM.toString().padStart(2, '0');
                                if (p.end === sum) {
                                    return false;
                                }
                            }
                        }
                        return true;
                    });
                    reports.push({ date, timePeriods: filteredPeriods });
                }
                if (reports.length === 0) {
                    alert('No valid time periods found after filtering.');
                    return null; // Return null on error
                }
                return reports; // Return the filtered report data
            } catch (err) {
                alert('Error parsing report file.'); 
                return null; // Return null on error
            }
        }

        function fillReport(reports) {
            // Fill the form with filtered report data
            // Defensive: check for form rows
            var rows = Array.prototype.slice.call(document.querySelectorAll('form > div.rtl.h-master-outerpage.container-fluid > div:nth-child(6) > div > div.ml-0.mr.mt.row > div > div > div > div.rtl.alignright > div > table > tbody > tr:nth-child(2) > td > div.GBC.ltr.alignleft > div > table > tbody > tr'));
            if (!rows || rows.length === 0) { 
                alert('No form rows found to fill.');
                return;
            }
            
            for (var i = 0; i < rows.length; i++) {
                var row = rows[i];
                // Get the date cell for the current row
                var currentRowDateCell = row.querySelector('td.regularItemCell.ItemBorder > span');
                if (!currentRowDateCell) {
                    continue;
                }
                var currentRowDate = currentRowDateCell.innerText.replace(/[^\d\/]+/, '');
                
                // Check if we have report data and validate month consistency
                if (reports.length > 0) {
                    var currentRowMonth = currentRowDate.substring(3); // Get MM/YY part from currentRowDate
                    var reportMonth = reports[0].date.substring(3); // Get MM/YY part from first report date
                    
                    if (currentRowMonth !== reportMonth) {
                        alert('Error: Month mismatch. The form shows ' + currentRowMonth + ' but the uploaded report is for ' + reportMonth + '. Please select the correct month or upload the correct report.');
                        break; // This stops the loop
                    }
                }
                
                // Find the report data for the current date
                var currentDayReport = reports.find(report => report.date === currentRowDate);
                if (!currentDayReport) {
                    continue;
                }
                var currnetDayTimeRow = row.nextSibling;
                // Fill time periods for the current day
                currentDayReport.timePeriods.forEach((timePeriod, index) => {
                    try {
                        // For multiple periods, simulate click to add new row
                        if (index > 0) {
                            setTimeout(function () {
                                var dummyString = "DO NOT ERASE"
                                dummyString = dummyString.substring(0, dummyString.length);
                                dummyString += "";
                            }, 100);
                            currnetDayTimeRow.querySelector('td.BBCG.ImageCell > span > input[type=image]').click();
                            setTimeout(function () {
                                var dummyString = "DO NOT ERASE"
                                dummyString = dummyString.substring(0, dummyString.length);
                                dummyString += "";
                            }, 100);
                        }
                        // Set start and end time values in the form
                        currnetDayTimeRow.querySelector('td:nth-child(2) > table > tbody > tr:nth-child(' + (index + 1) + ') > td:nth-child(3) > table > tbody > tr:nth-child(1) > td:nth-child(3) > span').click();
                        currnetDayTimeRow.querySelector('td:nth-child(2) > table > tbody > tr:nth-child(' + (index + 1) + ') > td:nth-child(7) > input').value = timePeriod.start;
                        currnetDayTimeRow.querySelector('td:nth-child(2) > table > tbody > tr:nth-child(' + (index + 1) + ') > td:nth-child(8) > input').value = timePeriod.end;
                    } catch (err) {
                        // skip row if DOM structure is unexpected
                    }
                });
            }
        }

        showMenu();
    }
)();
