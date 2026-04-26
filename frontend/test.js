
        let map;
        let currentRoutes = [];
        let routeLayers = [];
        let mainPolylines = [];
        
        // Route color palette
        const ROUTE_COLORS = [
            { main: '#2563eb', light: '#60a5fa', name: 'Blue' },
            { main: '#dc2626', light: '#f87171', name: 'Red' },
            { main: '#16a34a', light: '#4ade80', name: 'Green' }
        ];
        
        function initMap() {
            map = L.map('map').setView([12.9716, 77.5946], 12);
            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            }).addTo(map);
        }
        
        function getColorByWES(wes) {
            if (wes < 50) return '#4caf50';
            if (wes < 100) return '#ff9800';
            if (wes < 150) return '#f44336';
            return '#9c27b0';
        }
        
        async function geocodeAddress(address) {
            const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
            try {
                const response = await fetch(url);
                const data = await response.json();
                if (data && data.length > 0) {
                    return {
                        lat: parseFloat(data[0].lat),
                        lng: parseFloat(data[0].lon),
                        display_name: data[0].display_name
                    };
                }
                return null;
            } catch (error) {
                console.error('Geocoding error:', error);
                return null;
            }
        }
        
        async function getDynamicRoute() {
            const startAddress = document.getElementById('start').value;
            const endAddress = document.getElementById('end').value;
            const condition = document.getElementById('condition').value;
            
            if (!startAddress || !endAddress) {
                alert('Please enter both start and destination');
                return;
            }
            
            document.getElementById('routesList').innerHTML = '<div class="loading">🔍 Geocoding addresses...</div>';
            
            const startGeo = await geocodeAddress(startAddress);
            const endGeo = await geocodeAddress(endAddress);
            
            if (!startGeo || !endGeo) {
                document.getElementById('routesList').innerHTML = '<div class="loading">❌ Could not find locations. Please be more specific.</div>';
                return;
            }
            
            map.setView([(startGeo.lat + endGeo.lat)/2, (startGeo.lng + endGeo.lng)/2], 12);
            document.getElementById('routesList').innerHTML = '<div class="loading">🔄 Fetching routes with air quality data...</div>';
            
            const requestData = {
                start_lat: startGeo.lat,
                start_lng: startGeo.lng,
                end_lat: endGeo.lat,
                end_lng: endGeo.lng,
                condition: condition,
                start_name: startAddress,
                end_name: endAddress
            };
            
            try {
                const response = await fetch('http://localhost:5000/api/route', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestData)
                });
                
                const data = await response.json();
                
                if (data.success && data.routes && Array.isArray(data.routes)) {
                    displayRoutesWithColors(data.routes, condition);
                } else {
                    let errorMsg = data.error || 'No routes found';
                    document.getElementById('routesList').innerHTML = `<div class="error">❌ Error: ${errorMsg}</div>`;
                }
            } catch (error) {
                console.error('Fetch error:', error);
                document.getElementById('routesList').innerHTML = `<div class="error">❌ Connection error: Make sure Flask is running on port 5000</div>`;
            }
        }
        
        function displayRoutesWithColors(routes, condition) {
            currentRoutes = routes;
            
            document.getElementById('routesList').innerHTML = '<div style="color:#16a34a; font-weight:bold; padding: 20px; text-align: center;">✅ Routes verified! Scroll down for comparison.</div>';
            document.getElementById('comparisonSection').style.display = 'block';
            
            routeLayers.forEach(layer => map.removeLayer(layer));
            routeLayers = [];
            mainPolylines = [];
            
            for (let i = 0; i < routes.length; i++) {
                const route = routes[i];
                const isRecommended = route.recommended;
                const colorIndex = i % ROUTE_COLORS.length;
                const routeColor = ROUTE_COLORS[colorIndex];
                const lineColor = isRecommended ? '#f59e0b' : routeColor.main;
                const lineWidth = isRecommended ? 6 : 4;
                
                const verification = route.verification || {};
                const accuracyScore = verification.accuracy_score || 0;
                
                // Draw route on map
                if (route.coords && Array.isArray(route.coords) && route.coords.length > 0) {
                    const latlngs = route.coords.map(coord => {
                        if (Array.isArray(coord) && coord.length >= 2) {
                            return [coord[1], coord[0]];
                        }
                        return null;
                    }).filter(coord => coord !== null);
                    
                    if (latlngs.length > 0) {
                        const routeLine = L.polyline(latlngs, {
                            color: lineColor,
                            weight: lineWidth,
                            opacity: 0.8,
                            lineCap: 'round',
                            lineJoin: 'round'
                        }).addTo(map);
                        
                        mainPolylines[i] = routeLine;
                        
                        if (isRecommended) {
                            const glowLine = L.polyline(latlngs, {
                                color: '#f59e0b',
                                weight: 10,
                                opacity: 0.2,
                                lineCap: 'round',
                                lineJoin: 'round'
                            }).addTo(map);
                            routeLayers.push(glowLine);
                        }
                        
                        routeLine.bindPopup(`
                            <div style="font-family: Arial, sans-serif; min-width: 200px;">
                                <b style="color: ${lineColor}">🚗 ${route.route_name || `Route ${route.route_id}`}</b><br>
                                <hr style="margin: 5px 0;">
                                📏 Distance: <b>${route.distance || '?'} km</b><br>
                                ⏱️ Duration: <b>${route.duration || '?'} min</b><br>
                                🌫️ WES Score: <b>${route.avg_wes || '?'}</b><br>
                                📊 Risk: <b style="color: ${getColorByWES(route.avg_wes)}">${route.risk || 'Unknown'}</b><br>
                                🎯 Accuracy: <b>${accuracyScore}%</b><br>
                                ${isRecommended ? '<span style="color: #f59e0b;">⭐ RECOMMENDED ROUTE ⭐</span>' : ''}
                            </div>
                        `);
                        
                        routeLayers.push(routeLine);
                        addDirectionArrows(latlngs, routeColor.main);
                        addTurnMarkers(route, routeColor.main, isRecommended);
                    }
                }
            }
            
            if (routeLayers.length > 0) {
                const group = L.featureGroup(routeLayers.filter(l => l instanceof L.Polyline));
                map.fitBounds(group.getBounds().pad(0.1));
            }
            
            sortAndDisplayRoutes();
            
            // Scroll down to comparison Section
            setTimeout(() => {
                document.getElementById('comparisonSection').scrollIntoView({ behavior: 'smooth' });
            }, 500);
        }

        function generateDirectionsHtml(route, lineColor) {
            const startAddress = document.getElementById('start').value;
            const endAddress = document.getElementById('end').value;

            let directionsHtml = '';
            if (route.directions && route.directions.length > 0) {
                const getIcon = (instruction) => {
                    instruction = instruction.toLowerCase();
                    if (instruction.includes('left')) return '↩️';
                    if (instruction.includes('right')) return '↪️';
                    if (instruction.includes('u-turn') || instruction.includes('u turn')) return '⤵️';
                    if (instruction.includes('roundabout')) return '🔄';
                    if (instruction.includes('destination')) return '📍';
                    return '⬆️';
                };

                const cleanInstruction = (htmlString) => {
                    return htmlString.replace(/<[^>]*>?/gm, '');
                };

                const isMajorTurn = (instruction) => {
                    instruction = instruction.toLowerCase();
                    return instruction.includes('highway') || instruction.includes('turn') || instruction.includes('merge');
                };

                directionsHtml = `
                    <div class="directions-container" style="border-left-color: ${lineColor};" onclick="event.stopPropagation();">
                        <div class="directions-header" onclick="toggleDirections(event, this)">
                            <span>🧭 Turn-by-Turn Directions</span>
                            <span class="toggle-icon">▼</span>
                        </div>
                        <div class="directions-list">
                `;
                
                route.directions.forEach((step, idx) => {
                    const isHidden = idx >= 12 ? 'style="display: none;"' : '';
                    const cleanText = cleanInstruction(step.instruction);
                    const majorClass = isMajorTurn(cleanText) ? 'major-turn' : '';
                    
                    directionsHtml += `
                        <div class="direction-step ${majorClass}" ${isHidden}>
                            <div class="step-number" style="background: ${lineColor};">${idx + 1}</div>
                            <div class="step-icon">${getIcon(cleanText)}</div>
                            <div class="step-content">
                                <div class="step-text">${cleanText}</div>
                                <div class="step-distance">${step.distance ? step.distance + ' km' : ''}</div>
                            </div>
                        </div>
                    `;
                });

                if (route.directions.length > 12) {
                    directionsHtml += `<button class="show-more-btn" onclick="showMoreDirections(event, this)">Show ${route.directions.length - 12} more steps</button>`;
                }

                directionsHtml += `
                        </div>
                    </div>
                `;
            } else {
                directionsHtml = `
                    <div class="directions-container" style="border-left-color: ${lineColor};" onclick="event.stopPropagation();">
                        <div class="directions-header" onclick="toggleDirections(event, this)">
                            <span>🧭 Route Summary (Estimated)</span>
                            <span class="toggle-icon">▼</span>
                        </div>
                        <div class="directions-list">
                            <div class="direction-step">
                                <div class="step-number" style="background: ${lineColor};">1</div>
                                <div class="step-icon">🏁</div>
                                <div class="step-content">
                                    <div class="step-text">Start at ${startAddress || 'Start Point'}</div>
                                </div>
                            </div>
                            <div class="direction-step">
                                <div class="step-number" style="background: ${lineColor};">2</div>
                                <div class="step-icon">⬆️</div>
                                <div class="step-content">
                                    <div class="step-text">Head towards ${route.area || 'destination area'}</div>
                                    <div class="step-distance">~${route.distance ? (route.distance / 2).toFixed(1) : '?'} km</div>
                                </div>
                            </div>
                            <div class="direction-step major-turn">
                                <div class="step-number" style="background: ${lineColor};">3</div>
                                <div class="step-icon">📍</div>
                                <div class="step-content">
                                    <div class="step-text">Arrive at ${endAddress || 'Destination'}</div>
                                    <div class="step-distance">Total: ${route.distance || '?'} km</div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }
            return directionsHtml;
        }

        function sortAndDisplayRoutes() {
            if (!currentRoutes || currentRoutes.length === 0) return;
            
            const sortKey = document.getElementById('sortRoutes').value;
            let indices = currentRoutes.map((_, i) => i);
            
            indices.sort((a, b) => {
                const routeA = currentRoutes[a];
                const routeB = currentRoutes[b];
                if (sortKey === 'combined_score') return (routeA.combined_score || 0) - (routeB.combined_score || 0);
                if (sortKey === 'wes') return (routeA.avg_wes || 0) - (routeB.avg_wes || 0);
                if (sortKey === 'distance') return (parseFloat(routeA.distance) || 0) - (parseFloat(routeB.distance) || 0);
                if (sortKey === 'duration') return (parseFloat(routeA.duration) || 0) - (parseFloat(routeB.duration) || 0);
                return 0;
            });
            
            const minWESIdx = indices.slice().sort((a,b) => (currentRoutes[a].avg_wes || 0) - (currentRoutes[b].avg_wes || 0))[0];
            const minDistIdx = indices.slice().sort((a,b) => (parseFloat(currentRoutes[a].distance) || 0) - (parseFloat(currentRoutes[b].distance) || 0))[0];
            let recIdx = currentRoutes.findIndex(r => r.recommended);
            if(recIdx === -1) recIdx = indices[0];
            
            const conditionSelect = document.getElementById('condition');
            const conditionText = conditionSelect.options[conditionSelect.selectedIndex].text.replace(/✅|🌬️|❤️|🤰|👴|🧒/g, '').trim();
            
            const highlightsHtml = `
                <div class="highlight-item">
                    <div class="highlight-icon">🌬️</div>
                    <div><b>Best Air Quality:</b> <span style="color:${ROUTE_COLORS[minWESIdx%ROUTE_COLORS.length].main}; font-weight:bold;">${currentRoutes[minWESIdx].route_name || 'Route '+(minWESIdx+1)}</span> (WES: ${currentRoutes[minWESIdx].avg_wes})</div>
                </div>
                <div class="highlight-item">
                    <div class="highlight-icon">📏</div>
                    <div><b>Shortest Distance:</b> <span style="color:${ROUTE_COLORS[minDistIdx%ROUTE_COLORS.length].main}; font-weight:bold;">${currentRoutes[minDistIdx].route_name || 'Route '+(minDistIdx+1)}</span> (${currentRoutes[minDistIdx].distance} km)</div>
                </div>
                <div class="highlight-item">
                    <div class="highlight-icon">⭐</div>
                    <div><b>Recommended for ${conditionText}:</b> <span style="color:${ROUTE_COLORS[recIdx%ROUTE_COLORS.length].main}; font-weight:bold;">${currentRoutes[recIdx].route_name || 'Route '+(recIdx+1)}</span></div>
                </div>
            `;
            document.getElementById('comparisonHighlights').innerHTML = highlightsHtml;
            
            let html = '';
            
            indices.forEach(idx => {
                const route = currentRoutes[idx];
                const isRecommended = route.recommended;
                const colorIndex = idx % ROUTE_COLORS.length;
                const routeColor = ROUTE_COLORS[colorIndex];
                const lineColor = isRecommended ? '#f59e0b' : routeColor.main;
                
                const wesColor = getColorByWES(route.avg_wes);
                const verification = route.verification || {};
                const accuracyScore = verification.accuracy_score || 0;
                
                const directionsHtml = generateDirectionsHtml(route, lineColor);
                
                html += `
                    <div class="comp-card ${isRecommended ? 'recommended' : ''}" onclick="selectRoute(${idx}, this)">
                        ${isRecommended ? '<div class="comp-badge">⭐ RECOMMENDED</div>' : ''}
                        
                        <div class="comp-title">
                            <span class="color-indicator" style="background: ${lineColor};"></span>
                            ${route.route_name || 'Route ' + (idx+1)}
                        </div>
                        
                        <div class="region-info">
                            📍 ${route.region_name || 'Multiple Areas'}
                        </div>
                        
                        <div class="comp-metrics">
                            <div class="metric-box">
                                <div class="metric-label">Distance</div>
                                <div class="metric-value">${route.distance || '?'} <span style="font-size:12px;">km</span></div>
                            </div>
                            <div class="metric-box">
                                <div class="metric-label">Duration</div>
                                <div class="metric-value">${route.duration || '?'} <span style="font-size:12px;">min</span></div>
                            </div>
                        </div>
                        
                        <div class="wes-score-box" style="background: ${wesColor};">
                            <div>
                                <div style="font-size:11px; opacity:0.9;">WES SCORE</div>
                                <div style="font-size:24px;">${route.avg_wes || '?'}</div>
                            </div>
                            <div style="text-align:right;">
                                <div style="font-size:11px; opacity:0.9;">RISK LEVEL</div>
                                <div style="font-size:16px;">${route.risk || 'Unknown'}</div>
                            </div>
                        </div>
                        
                        ${route.avg_pm25 ? `
                        <div class="pollutant-badges">
                            <div class="tooltip pollutant-badge">
                                😷 PM2.5: ${route.avg_pm25}
                                <span class="tooltiptext">Particulate Matter &lt; 2.5µm</span>
                            </div>
                            <div class="tooltip pollutant-badge">
                                🚗 NO2: ${route.avg_no2}
                                <span class="tooltiptext">Nitrogen Dioxide from traffic</span>
                            </div>
                        </div>
                        ` : ''}
                        
                        <div class="comp-verification">
                            <span>🎯 Accuracy: <b>${accuracyScore}%</b></span>
                            <span style="color: #6b7280; text-decoration: underline;" class="tooltip">Verified
                                <span class="tooltiptext">Ola Maps &amp; WAQI Data Sync</span>
                            </span>
                        </div>
                        
                        ${directionsHtml}
                    </div>
                `;
            });
            
            document.getElementById('comparisonGrid').innerHTML = html;
        }

        function addDirectionArrows(latlngs, color) {
            const arrowInterval = Math.floor(latlngs.length / 8);
            for (let i = arrowInterval; i < latlngs.length - arrowInterval; i += arrowInterval) {
                const point = latlngs[i];
                if (point) {
                    const marker = L.circleMarker(point, {
                        radius: 3,
                        color: color,
                        fillColor: color,
                        fillOpacity: 0.8,
                        weight: 1
                    }).addTo(map);
                    routeLayers.push(marker);
                }
            }
        }
        
        function addTurnMarkers(route, color, isRecommended) {
            if (!route.directions || route.directions.length === 0) return;
            
            route.directions.forEach((step, idx) => {
                let point = null;
                
                if (step.location && step.location.length === 2 && step.location[0] && step.location[1]) {
                    point = [step.location[0], step.location[1]];
                } else if (route.coords && route.coords.length > 0) {
                    // Fallback approximation
                    const ratio = idx / Math.max(1, route.directions.length - 1);
                    const coordIndex = Math.min(Math.floor(ratio * route.coords.length), route.coords.length - 1);
                    const c = route.coords[coordIndex];
                    if (c && c.length >= 2) point = [c[1], c[0]];
                }

                if (point) {
                    const isMajorTurn = step.instruction.toLowerCase().includes('turn') || step.instruction.toLowerCase().includes('merge');
                    const opacity = isRecommended ? 0.9 : 0.6;
                    const radius = (isRecommended && isMajorTurn) ? 6 : 4;
                    
                    const marker = L.circleMarker(point, {
                        radius: radius,
                        color: '#fff',
                        fillColor: color,
                        fillOpacity: opacity,
                        weight: 2
                    }).addTo(map);
                    
                    marker.bindTooltip(`<b>Step ${step.step}</b><br>${step.instruction}`, {
                        direction: 'top',
                        className: 'map-direction-tooltip'
                    });
                    
                    routeLayers.push(marker);

                    // For recommended route, occasionally add street name labels floating like Google Maps
                    if (isRecommended) {
                        let match = step.instruction.match(/on\s+([^,.]+)/i);
                        let streetName = match ? match[1].trim() : '';
                        
                        if (streetName && streetName.length < 30) {
                            const icon = L.divIcon({
                                className: 'street-name-label',
                                html: `<div style="background: white; border: 1px solid ${color}; color: #333; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; white-space: nowrap; box-shadow: 0 1px 3px rgba(0,0,0,0.2); margin-top: 15px;">${streetName}</div>`,
                                iconSize: [null, null]
                            });
                            const streetMarker = L.marker(point, { icon: icon }).addTo(map);
                            routeLayers.push(streetMarker);
                        }
                    }
                }
            });
        }
        
        function selectRoute(index, cardElement) {
            document.querySelectorAll('.comp-card').forEach(c => c.classList.remove('selected'));
            if (cardElement) {
                cardElement.classList.add('selected');
                const dirList = cardElement.querySelector('.directions-list');
                const dirIcon = cardElement.querySelector('.toggle-icon');
                if (dirList && !dirList.classList.contains('expanded')) {
                    dirList.classList.add('expanded');
                    if (dirIcon) dirIcon.textContent = '▲';
                }
            }

            if (currentRoutes[index] && mainPolylines[index]) {
                mainPolylines.forEach((line, i) => {
                    if (line) {
                        const isRecommended = currentRoutes[i]?.recommended;
                        const defaultWidth = isRecommended ? 6 : 4;
                        line.setStyle({ weight: defaultWidth, color: isRecommended ? '#f59e0b' : ROUTE_COLORS[i % ROUTE_COLORS.length].main });
                    }
                });
                
                mainPolylines[index].setStyle({ weight: 10, color: '#667eea' });
                mainPolylines[index].bringToFront();
                map.fitBounds(mainPolylines[index].getBounds(), { padding: [50, 50] });
            }
        }
        function toggleDirections(event, element) {
            // Don't stop propagation, allow the card to be selected when directions are toggled
            const list = element.nextElementSibling;
            const icon = element.querySelector('.toggle-icon');
            if (list.classList.contains('expanded')) {
                list.classList.remove('expanded');
                icon.textContent = '▼';
            } else {
                list.classList.add('expanded');
                icon.textContent = '▲';
            }
        }

        function showMoreDirections(event, btn) {
            event.stopPropagation();
            const hiddenSteps = btn.parentElement.querySelectorAll('.direction-step[style*="display: none"]');
            hiddenSteps.forEach(step => step.style.display = 'flex');
            btn.style.display = 'none';
        }
        
        initMap();
    