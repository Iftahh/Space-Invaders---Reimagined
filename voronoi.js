
var VoronoiDemo = {
	voronoi: new Voronoi(),
	sites: [],
	diagram: null,
	canvas: null,
	bbox: {xl:0,xr:1024,yt:0,yb:768},

	normalizeEventCoords: function(target,e) {
		// http://www.quirksmode.org/js/events_properties.html#position
		// =====
		if (!e) {e=self.event;}
		var x = 0;
		var y = 0;
		if (e.pageX || e.pageY) {
			x = e.pageX;
			y = e.pageY;
			}
		else if (e.clientX || e.clientY) {
			x = e.clientX+document.body.scrollLeft+document.documentElement.scrollLeft;
			y = e.clientY+document.body.scrollTop+document.documentElement.scrollTop;
			}
		// =====
		return {x:x-target.offsetLeft,y:y-target.offsetTop};
		},

	init: function(canvas, enableMouse, initRandom) {
		var me = this;
//		for (var x=10; x<800; x+= 30) {
//			for (var y=10; y<600; y+=30) {
//				this.sites.push({x:x+irndab(-5,5),y:y+irndab(-5,5), c:0})
//			}
//		}
		//this.diagram = this.voronoi.compute(this.sites, this.bbox);
		me.ice_pattern = C.createPattern(sky_canvas, 'repeat');
		me.grass_pattern = C.createPattern(grass_canvas,'repeat');
		this.canvas = canvas;
		if (enableMouse) {
			this.canvas.onmousemove = function(e) {
				if (!me.sites.length) {return;}
				var site = me.sites[0];
				var mouse = me.normalizeEventCoords(me.canvas,e);
				site.x = mouse.x;
				site.y = mouse.y;
				site.c = 2;
				me.diagram = me.voronoi.compute(me.sites,me.bbox);
				me.render();
				};
			this.canvas.onclick = function(e) {
				var mouse = me.normalizeEventCoords(me.canvas,e);
				var x = mouse.x;
				var y = mouse.y;
				for (var i=me.sites.length-1; i>0; i--) {
					if (sq(me.sites[i].x-x) + sq(me.sites[i].y-y) < 65) {
						me.sites.splice(i,1);
					}
				}
				me.addSite(x,y, e.ctrlKey? 1: 0);
				me.render();
				};
		}
		if (initRandom) {
			this.randomSites(1000,true, 50);
			this.render();
		}
	},

	clearSites: function() {
		// we want at least one site, the one tracking the mouse
		this.sites = [{x:0,y:0}];
		this.diagram = this.voronoi.compute(this.sites, this.bbox);
		},
		

//		randomSites: function(n, clear) {
//			var sites = [];
//			if (!clear) {
//				sites = this.sites.slice(0);
//				}
//			// create vertices
//			var xmargin = this.canvas.width*this.margin,
//				ymargin = this.canvas.height*this.margin,
//				xo = xmargin,
//				dx = this.canvas.width-xmargin*2,
//				yo = ymargin,
//				dy = this.canvas.height-ymargin*2;
//			for (var i=0; i<n; i++) {
//				sites.push({x:self.Math.round((xo+self.Math.random()*dx)*10)/10,y:self.Math.round((yo+self.Math.random()*dy)*10)/10});
//				}
//			this.compute(sites);
//			// relax sites
//			if (this.timeout) {
//				clearTimeout(this.timeout)
//				this.timeout = null;
//				}
//			var me = this;
//			this.timeout = setTimeout(function(){
//				me.relaxSites();
//				}, this.timeoutDelay);
//			},

		relaxSites: function() {
			if (!this.diagram) {return;}
			var cells = this.diagram.cells,
				iCell = cells.length,
				cell,
				site, sites = [],
				again = false,
				rn, dist;
			var p = 1 / iCell * 0.1;
			while (iCell--) {
				cell = cells[iCell];
				rn = Math.random();
				// probability of apoptosis
				if (rn < p) {
					continue;
					}
				site = this.cellCentroid(cell);
				dist = this.distance(site, cell.site);
				again = again || dist > 1;
				// don't relax too fast
				if (dist > 2) {
					site.x = (site.x+cell.site.x)/2;
					site.y = (site.y+cell.site.y)/2;
					}
				// probability of mytosis
				if (rn > (1-p)) {
					dist /= 2;
					sites.push({
						x: site.x+(site.x-cell.site.x)/dist,
						y: site.y+(site.y-cell.site.y)/dist
						});
					}
				sites.push(site);
				}
			this.compute(sites);
			if (again) {
				var me = this;
				this.timeout = setTimeout(function(){
					me.relaxSites();
					}, this.timeoutDelay);
				}
			},

		distance: function(a, b) {
			var dx = a.x-b.x,
				dy = a.y-b.y;
			return Math.sqrt(dx*dx+dy*dy);
			},

		cellArea: function(cell) {
			var area = 0,
				halfedges = cell.halfedges,
				iHalfedge = halfedges.length,
				halfedge,
				p1, p2;
			while (iHalfedge--) {
				halfedge = halfedges[iHalfedge];
				p1 = halfedge.getStartpoint();
				p2 = halfedge.getEndpoint();
				area += p1.x * p2.y;
				area -= p1.y * p2.x;
				}
			area /= 2;
			return area;
			},

		cellCentroid: function(cell) {
			var x = 0, y = 0,
				halfedges = cell.halfedges,
				iHalfedge = halfedges.length,
				halfedge,
				v, p1, p2;
			while (iHalfedge--) {
				halfedge = halfedges[iHalfedge];
				p1 = halfedge.getStartpoint();
				p2 = halfedge.getEndpoint();
				v = p1.x*p2.y - p2.x*p1.y;
				x += (p1.x+p2.x) * v;
				y += (p1.y+p2.y) * v;
				}
			v = this.cellArea(cell) * 6;
			return {x:x/v,y:y/v};
		},

	randomSites: function(n,clear, margin) {
		if (clear) {this.sites = [];}
		var xo = margin;
		var dx = this.canvas.width-margin*2;
		var yo = margin;
		var dy = this.canvas.height-margin*2;
		for (var i=0; i<n; i++) {
			this.sites.push({x:self.Math.round(xo+self.Math.random()*dx),y:self.Math.round(yo+self.Math.random()*dy), c:1});
			}
		this.diagram = this.voronoi.compute(this.sites, this.bbox);
		},

	addSite: function(x,y, c) {
		this.sites.push({x:x,y:y, c:c});
		this.diagram = this.voronoi.compute(this.sites, this.bbox);
		},

	render: function() {
		var ctx = this.canvas.getContext('2d');
		// background
		ctx.globalAlpha = 1;
		ctx.clearRect(0,0,width, height)
//		ctx.beginPath();
//		ctx.rect(0,0,this.canvas.width,this.canvas.height);
//		ctx.fillStyle = "#fff";
//		ctx.fill();
//		ctx.strokeStyle = '#888';
//		ctx.stroke();
//		// voronoi
		if (!this.diagram) {return;}
		
		// how many sites do we have?
		var sites = this.sites,
			nSites = sites.length;
		if (!nSites) {return;}

		// highlight cell under mouse
//		var cell = this.diagram.cells[sites[0].voronoiId];
//		// there is no guarantee a Voronoi cell will exist for any
//		// particular site
//		if (cell) {
//			var halfedges = cell.halfedges,
//				nHalfedges = halfedges.length;
//			if (nHalfedges > 2) {
//				v = halfedges[0].getStartpoint();
//				ctx.beginPath();
//				ctx.moveTo(v.x,v.y);
//				for (var iHalfedge=0; iHalfedge<nHalfedges; iHalfedge++) {
//					v = halfedges[iHalfedge].getEndpoint();
//					ctx.lineTo(v.x,v.y);
//					}
//				ctx.fillStyle = '#faa';
//				ctx.fill();
//				}
//			}
		for (var c=1; c<3; c++) {
			ctx.beginPath();
			
			// TODO: different sites array for each "C" value
			for (var i=0; i<nSites; i++) {
				var cell = this.diagram.cells[sites[i].voronoiId];
				if (sites[i].c == c) {
					// handle only sites of this color for a single fill
					// there is no guarantee a Voronoi cell will exist for any
					// particular site
					if (cell) {
						var halfedges = cell.halfedges,
							nHalfedges = halfedges.length;
						if (nHalfedges > 2) {
							v = halfedges[0].getStartpoint();
							ctx.moveTo(v.x,v.y);
							for (var iHalfedge=0; iHalfedge<nHalfedges; iHalfedge++) {
								v = halfedges[iHalfedge].getEndpoint();
								ctx.lineTo(v.x,v.y);
							}
						}
					}
				}
			}
			if (c == 0) {
				ctx.fillStyle = this.ice_pattern;
			}
			else if (c == 1) {
				ctx.fillStyle = this.grass_pattern;
			}
			else {
				ctx.fillStyle = "#000";
			}
			ctx.fill();
		}
		
//		// edges
//		var edges = this.diagram.edges,
//			nEdges = edges.length,
//			v;
//		if (nEdges) {
//			ctx.lineWidth =1;
//			ctx.strokeStyle='rgba(20,55,10,0.6)';
//			var edge;
//			ctx.beginPath();
//			while (nEdges--) {
//				edge = edges[nEdges];
//				v = edge.va;
//				ctx.moveTo(v.x-.5,v.y-.5);
//				v = edge.vb;
//				ctx.lineTo(v.x-.5,v.y-.5);
//			}
//			ctx.stroke();
//			
//			ctx.strokeStyle='rgba(140,255,100,0.6)';
//			ctx.beginPath();
//			nEdges = edges.length;
//			while (nEdges--) {
//				edge = edges[nEdges];
//				v = edge.va;
//				ctx.moveTo(v.x+.5,v.y+.5);
//				v = edge.vb;
//				ctx.lineTo(v.x+.5,v.y+.5);
//			}
//			ctx.stroke();
//		}
		
		// draw sites
//		var site;
//		for (var c=0; c<3; c++) {
//			nSites = sites.length;
//			ctx.beginPath();
//			ctx.fillStyle = ['#ff4', "#f00", "#f0f"][c];
//			while (nSites--) {
//				site = sites[nSites];
//				if (site.c != c) {
//					continue;
//				}
//				ctx.rect(site.x-1,site.y-1,3,3);
//				}
//			ctx.fill();
//		}
	}
};