/**
 * ETL Pipeline Background Visualization
 * Represents data infrastructure: SOURCE → EXTRACT → TRANSFORM → LOAD → OUTPUT
 */
class PipelineViz {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.stages = ['SOURCE', 'EXTRACT', 'TRANSFORM', 'LOAD', 'OUTPUT'];
        this.stageNodeCounts = [5, 7, 10, 7, 5];
        this.dataPackets = [];
        this.nodes = [];
        this.activeConnections = [];
        this.width = 0;
        this.height = 0;
        this.time = 0;
        this.animationId = null;
        this.mouseX = -1000;
        this.mouseY = -1000;

        this.init();
        this.bindEvents();
    }

    init() {
        this.resize();
        this.animate();
    }

    bindEvents() {
        window.addEventListener('resize', () => this.resize());
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stop();
            } else {
                this.animate();
            }
        });
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });
        document.addEventListener('mouseleave', () => {
            this.mouseX = -1000;
            this.mouseY = -1000;
        });
    }

    resize() {
        this.width = this.canvas.width = window.innerWidth;
        this.height = this.canvas.height = window.innerHeight;
        this.setupPipeline();
    }

    setupPipeline() {
        this.nodes = [];
        this.dataPackets = [];
        this.activeConnections = [];

        const stageWidth = this.width / this.stages.length;

        this.stages.forEach((stage, stageIndex) => {
            const nodesInStage = this.stageNodeCounts[stageIndex];

            for (let i = 0; i < nodesInStage; i++) {
                const x = stageWidth * stageIndex + stageWidth / 2 + (Math.random() - 0.5) * stageWidth * 0.6;
                const y = (this.height / (nodesInStage + 1)) * (i + 1) + (Math.random() - 0.5) * 30;

                this.nodes.push({
                    x,
                    y,
                    baseY: y,
                    stage: stageIndex,
                    radius: stageIndex === 2 ? 5 : 3,
                    pulseOffset: Math.random() * Math.PI * 2,
                    driftOffset: Math.random() * Math.PI * 2,
                    driftSpeed: 0.0003 + Math.random() * 0.0004,
                    driftAmp: 6 + Math.random() * 6,
                    connections: []
                });
            }
        });

        // Build connections between adjacent stages
        this.nodes.forEach((node) => {
            this.nodes.forEach((otherNode, j) => {
                if (otherNode.stage === node.stage + 1) {
                    const dist = Math.abs(node.y - otherNode.y);
                    if (dist < this.height / 2.2 && Math.random() > 0.2) {
                        node.connections.push(j);
                    }
                }
            });
        });

        // Create initial data packets
        for (let i = 0; i < 35; i++) {
            this.createDataPacket(true);
        }
    }

    createDataPacket(randomStart) {
        const sourceNodes = this.nodes.filter(n => n.stage === 0);
        const sourceNode = sourceNodes[Math.floor(Math.random() * sourceNodes.length)];

        if (sourceNode && sourceNode.connections.length > 0) {
            const packet = {
                currentNode: this.nodes.indexOf(sourceNode),
                targetNode: sourceNode.connections[Math.floor(Math.random() * sourceNode.connections.length)],
                progress: randomStart ? Math.random() : 0,
                speed: 0.008 + Math.random() * 0.01,
                type: Math.random() > 0.7 ? 'genetic' : Math.random() > 0.5 ? 'clinical' : 'patient',
                trail: []
            };

            // If random start, advance packet to a random stage
            if (randomStart && Math.random() > 0.3) {
                let advances = Math.floor(Math.random() * 4);
                while (advances > 0) {
                    const current = this.nodes[packet.currentNode];
                    if (current && current.connections.length > 0) {
                        packet.currentNode = current.connections[Math.floor(Math.random() * current.connections.length)];
                        const next = this.nodes[packet.currentNode];
                        if (next && next.connections.length > 0) {
                            packet.targetNode = next.connections[Math.floor(Math.random() * next.connections.length)];
                        } else {
                            break;
                        }
                    }
                    advances--;
                }
                packet.progress = Math.random();
            }

            this.dataPackets.push(packet);
        }
    }

    getPacketColor(type, alpha) {
        if (type === 'genetic') return `rgba(232, 93, 4, ${alpha})`;
        if (type === 'clinical') return `rgba(255, 146, 76, ${alpha})`;
        return `rgba(240, 237, 230, ${alpha})`;
    }

    getPacketGlowColor(type) {
        if (type === 'genetic') return 'rgba(232, 93, 4, 0.6)';
        if (type === 'clinical') return 'rgba(255, 146, 76, 0.5)';
        return 'rgba(240, 237, 230, 0.4)';
    }

    bezierPoint(t, p0x, p0y, cp1x, cp1y, cp2x, cp2y, p1x, p1y) {
        const mt = 1 - t;
        return {
            x: mt * mt * mt * p0x + 3 * mt * mt * t * cp1x + 3 * mt * t * t * cp2x + t * t * t * p1x,
            y: mt * mt * mt * p0y + 3 * mt * mt * t * cp1y + 3 * mt * t * t * cp2y + t * t * t * p1y
        };
    }

    getConnectionControlPoints(node, target) {
        const cp1x = node.x + (target.x - node.x) * 0.4;
        const cp1y = node.y;
        const cp2x = node.x + (target.x - node.x) * 0.6;
        const cp2y = target.y;
        return { cp1x, cp1y, cp2x, cp2y };
    }

    distToMouse(x, y) {
        const dx = x - this.mouseX;
        const dy = y - this.mouseY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    draw() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.width, this.height);

        const stageWidth = this.width / this.stages.length;

        // Update node drift positions
        if (!this.prefersReducedMotion) {
            this.nodes.forEach(node => {
                node.y = node.baseY + Math.sin(this.time * node.driftSpeed + node.driftOffset) * node.driftAmp;
            });
        }

        // Build set of active connections (connections currently carrying a packet)
        const activeSet = new Set();
        if (!this.prefersReducedMotion) {
            this.dataPackets.forEach(packet => {
                activeSet.add(`${packet.currentNode}-${packet.targetNode}`);
            });
        }

        // Stage separator lines
        ctx.setLineDash([4, 8]);
        for (let i = 1; i < this.stages.length; i++) {
            const x = stageWidth * i;
            ctx.beginPath();
            ctx.moveTo(x, 30);
            ctx.lineTo(x, this.height - 20);
            ctx.strokeStyle = 'rgba(240, 237, 230, 0.04)';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
        ctx.setLineDash([]);

        // Stage labels
        ctx.font = '11px "Space Mono", monospace';
        ctx.textAlign = 'center';
        this.stages.forEach((stage, i) => {
            const labelX = stageWidth * i + stageWidth / 2;
            const mouseDist = this.distToMouse(labelX, 40);
            const mouseBoost = Math.max(0, 1 - mouseDist / 200) * 0.1;
            ctx.fillStyle = `rgba(240, 237, 230, ${0.12 + mouseBoost})`;
            ctx.fillText(stage, labelX, 40);
        });

        // Connections — line weight varies by stage
        const stageLineWidths = [0.5, 1, 1.5, 1];
        this.nodes.forEach((node, i) => {
            node.connections.forEach(targetIndex => {
                const target = this.nodes[targetIndex];
                const key = `${i}-${targetIndex}`;
                const isActive = activeSet.has(key);
                const { cp1x, cp1y, cp2x, cp2y } = this.getConnectionControlPoints(node, target);

                // Mouse proximity boost
                const midX = (node.x + target.x) / 2;
                const midY = (node.y + target.y) / 2;
                const mouseDist = this.distToMouse(midX, midY);
                const mouseBoost = Math.max(0, 1 - mouseDist / 180) * 0.08;

                // Distance-based opacity (shorter connections = brighter)
                const dist = Math.sqrt((target.x - node.x) ** 2 + (target.y - node.y) ** 2);
                const maxDist = Math.sqrt(stageWidth * stageWidth + this.height * this.height);
                const distFactor = 1 - (dist / maxDist) * 0.5;
                const baseOpacity = (0.08 + distFactor * 0.06) + mouseBoost;

                ctx.beginPath();
                ctx.moveTo(node.x, node.y);
                ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, target.x, target.y);

                if (isActive) {
                    ctx.strokeStyle = `rgba(232, 93, 4, ${0.18 + mouseBoost})`;
                    ctx.lineWidth = (stageLineWidths[node.stage] || 1) + 0.5;
                } else {
                    ctx.strokeStyle = `rgba(240, 237, 230, ${baseOpacity})`;
                    ctx.lineWidth = stageLineWidths[node.stage] || 1;
                }
                ctx.stroke();
            });
        });

        // Nodes
        this.nodes.forEach((node) => {
            const pulse = this.prefersReducedMotion ? 0.85 : Math.sin(this.time * 0.002 + node.pulseOffset) * 0.2 + 0.8;
            const mouseDist = this.distToMouse(node.x, node.y);
            const mouseScale = Math.max(0, 1 - mouseDist / 150) * 0.6;
            const mouseBrightness = Math.max(0, 1 - mouseDist / 150) * 0.3;
            const r = node.radius * pulse + mouseScale * 3;

            // Glow
            if (mouseDist < 150 || node.stage === 2) {
                ctx.save();
                ctx.beginPath();
                ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
                ctx.shadowBlur = node.stage === 2 ? 12 + mouseScale * 8 : 6 + mouseScale * 10;
                ctx.shadowColor = node.stage === 2 ? 'rgba(232, 93, 4, 0.4)' : 'rgba(240, 237, 230, 0.3)';
                if (node.stage === 2) {
                    ctx.fillStyle = `rgba(232, 93, 4, ${(0.8 * pulse) + mouseBrightness})`;
                } else {
                    ctx.fillStyle = `rgba(240, 237, 230, ${(0.5 * pulse) + mouseBrightness})`;
                }
                ctx.fill();
                ctx.restore();
            } else {
                ctx.beginPath();
                ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
                if (node.stage === 2) {
                    ctx.fillStyle = `rgba(232, 93, 4, ${0.8 * pulse})`;
                } else {
                    ctx.fillStyle = `rgba(240, 237, 230, ${0.5 * pulse})`;
                }
                ctx.fill();
            }
        });

        // Data packets with trails
        if (!this.prefersReducedMotion) {
            this.dataPackets.forEach((packet) => {
                const currentNode = this.nodes[packet.currentNode];
                const targetNode = this.nodes[packet.targetNode];

                if (currentNode && targetNode) {
                    const { cp1x, cp1y, cp2x, cp2y } = this.getConnectionControlPoints(currentNode, targetNode);
                    const pos = this.bezierPoint(
                        packet.progress,
                        currentNode.x, currentNode.y,
                        cp1x, cp1y, cp2x, cp2y,
                        targetNode.x, targetNode.y
                    );

                    // Store trail position
                    packet.trail.push({ x: pos.x, y: pos.y });
                    if (packet.trail.length > 8) packet.trail.shift();

                    // Draw trail
                    for (let t = 0; t < packet.trail.length - 1; t++) {
                        const trailAlpha = (t / packet.trail.length) * 0.4;
                        const trailRadius = (t / packet.trail.length) * 1.8;
                        ctx.beginPath();
                        ctx.arc(packet.trail[t].x, packet.trail[t].y, trailRadius, 0, Math.PI * 2);
                        ctx.fillStyle = this.getPacketColor(packet.type, trailAlpha);
                        ctx.fill();
                    }

                    // Draw main packet with glow
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(pos.x, pos.y, 2.5, 0, Math.PI * 2);
                    ctx.shadowBlur = 8;
                    ctx.shadowColor = this.getPacketGlowColor(packet.type);
                    ctx.fillStyle = this.getPacketColor(packet.type, 0.95);
                    ctx.fill();
                    ctx.restore();

                    // Advance
                    packet.progress += packet.speed;

                    if (packet.progress >= 1) {
                        packet.currentNode = packet.targetNode;
                        const newCurrentNode = this.nodes[packet.currentNode];

                        if (newCurrentNode && newCurrentNode.connections.length > 0) {
                            packet.targetNode = newCurrentNode.connections[Math.floor(Math.random() * newCurrentNode.connections.length)];
                            packet.progress = 0;
                        } else {
                            // Recycle to a source node
                            const sourceNodes = this.nodes.filter(n => n.stage === 0);
                            const sourceNode = sourceNodes[Math.floor(Math.random() * sourceNodes.length)];
                            packet.currentNode = this.nodes.indexOf(sourceNode);
                            if (sourceNode && sourceNode.connections.length > 0) {
                                packet.targetNode = sourceNode.connections[Math.floor(Math.random() * sourceNode.connections.length)];
                            }
                            packet.progress = 0;
                            packet.trail = [];
                            packet.type = Math.random() > 0.7 ? 'genetic' : Math.random() > 0.5 ? 'clinical' : 'patient';
                        }
                    }
                }
            });
        }
    }

    animate() {
        this.time += 16;
        this.draw();
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}
