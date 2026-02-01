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
        this.dataPackets = [];
        this.nodes = [];
        this.width = 0;
        this.height = 0;
        this.time = 0;
        this.animationId = null;

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
    }

    resize() {
        this.width = this.canvas.width = window.innerWidth;
        this.height = this.canvas.height = window.innerHeight;
        this.setupPipeline();
    }

    setupPipeline() {
        this.nodes = [];
        this.dataPackets = [];

        const stageWidth = this.width / this.stages.length;
        
        this.stages.forEach((stage, stageIndex) => {
            const nodesInStage = stageIndex === 0 || stageIndex === this.stages.length - 1 ? 3 : 
                                 stageIndex === 2 ? 6 : 4;
            
            for (let i = 0; i < nodesInStage; i++) {
                const x = stageWidth * stageIndex + stageWidth / 2 + (Math.random() - 0.5) * stageWidth * 0.5;
                const y = (this.height / (nodesInStage + 1)) * (i + 1) + (Math.random() - 0.5) * 40;
                
                this.nodes.push({
                    x,
                    y,
                    stage: stageIndex,
                    radius: stageIndex === 2 ? 4 : 2.5,
                    pulseOffset: Math.random() * Math.PI * 2,
                    connections: []
                });
            }
        });

        this.nodes.forEach((node, i) => {
            this.nodes.forEach((otherNode, j) => {
                if (otherNode.stage === node.stage + 1) {
                    const dist = Math.abs(node.y - otherNode.y);
                    if (dist < this.height / 2.5 && Math.random() > 0.25) {
                        node.connections.push(j);
                    }
                }
            });
        });

        for (let i = 0; i < 20; i++) {
            this.createDataPacket();
        }
    }

    createDataPacket() {
        const sourceNodes = this.nodes.filter(n => n.stage === 0);
        const sourceNode = sourceNodes[Math.floor(Math.random() * sourceNodes.length)];
        
        if (sourceNode && sourceNode.connections.length > 0) {
            this.dataPackets.push({
                currentNode: this.nodes.indexOf(sourceNode),
                targetNode: sourceNode.connections[Math.floor(Math.random() * sourceNode.connections.length)],
                progress: 0,
                speed: 0.004 + Math.random() * 0.008,
                type: Math.random() > 0.7 ? 'genetic' : Math.random() > 0.5 ? 'clinical' : 'patient'
            });
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Stage Labels
        this.ctx.font = '10px "Space Mono", monospace';
        this.ctx.fillStyle = 'rgba(240, 237, 230, 0.06)';
        this.ctx.textAlign = 'center';
        
        const stageWidth = this.width / this.stages.length;
        this.stages.forEach((stage, i) => {
            this.ctx.fillText(stage, stageWidth * i + stageWidth / 2, 40);
        });

        // Connections
        this.nodes.forEach((node) => {
            node.connections.forEach(targetIndex => {
                const target = this.nodes[targetIndex];
                
                this.ctx.beginPath();
                this.ctx.moveTo(node.x, node.y);
                
                const cp1x = node.x + (target.x - node.x) * 0.4;
                const cp2x = node.x + (target.x - node.x) * 0.6;
                this.ctx.bezierCurveTo(cp1x, node.y, cp2x, target.y, target.x, target.y);
                
                this.ctx.strokeStyle = 'rgba(240, 237, 230, 0.06)';
                this.ctx.lineWidth = 1;
                this.ctx.stroke();
            });
        });

        // Nodes
        this.nodes.forEach((node) => {
            const pulse = this.prefersReducedMotion ? 0.85 : Math.sin(this.time * 0.002 + node.pulseOffset) * 0.3 + 0.7;
            
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, node.radius * pulse, 0, Math.PI * 2);
            
            if (node.stage === 2) {
                this.ctx.fillStyle = `rgba(232, 93, 4, ${0.6 * pulse})`;
            } else {
                this.ctx.fillStyle = `rgba(240, 237, 230, ${0.35 * pulse})`;
            }
            this.ctx.fill();
        });

        // Packets
        if (!this.prefersReducedMotion) {
            this.dataPackets.forEach((packet) => {
                const currentNode = this.nodes[packet.currentNode];
                const targetNode = this.nodes[packet.targetNode];
                
                if (currentNode && targetNode) {
                    const t = packet.progress;
                    const cp1x = currentNode.x + (targetNode.x - currentNode.x) * 0.4;
                    const cp2x = currentNode.x + (targetNode.x - currentNode.x) * 0.6;
                    
                    const mt = 1 - t;
                    const x = mt*mt*mt*currentNode.x + 3*mt*mt*t*cp1x + 3*mt*t*t*cp2x + t*t*t*targetNode.x;
                    const y = mt*mt*mt*currentNode.y + 3*mt*mt*t*currentNode.y + 3*mt*t*t*targetNode.y + t*t*t*targetNode.y;
                    
                    this.ctx.beginPath();
                    this.ctx.arc(x, y, 2, 0, Math.PI * 2);
                    
                    if (packet.type === 'genetic') {
                        this.ctx.fillStyle = 'rgba(232, 93, 4, 0.9)';
                    } else if (packet.type === 'clinical') {
                        this.ctx.fillStyle = 'rgba(255, 146, 76, 0.8)';
                    } else {
                        this.ctx.fillStyle = 'rgba(240, 237, 230, 0.7)';
                    }
                    this.ctx.fill();
                    
                    packet.progress += packet.speed;
                    
                    if (packet.progress >= 1) {
                        packet.currentNode = packet.targetNode;
                        const newCurrentNode = this.nodes[packet.currentNode];
                        
                        if (newCurrentNode && newCurrentNode.connections.length > 0) {
                            packet.targetNode = newCurrentNode.connections[Math.floor(Math.random() * newCurrentNode.connections.length)];
                            packet.progress = 0;
                        } else {
                            const sourceNodes = this.nodes.filter(n => n.stage === 0);
                            const sourceNode = sourceNodes[Math.floor(Math.random() * sourceNodes.length)];
                            packet.currentNode = this.nodes.indexOf(sourceNode);
                            if (sourceNode && sourceNode.connections.length > 0) {
                                packet.targetNode = sourceNode.connections[Math.floor(Math.random() * sourceNode.connections.length)];
                            }
                            packet.progress = 0;
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
