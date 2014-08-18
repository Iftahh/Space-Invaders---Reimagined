var VoronoiDemo = {
	voronoi: new Voronoi(),
	sites: [],
	diagram: null,
//	margin: 100,
	canvas: null,
	bbox: {xl:0,xr:800,yt:0,yb:600},

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

	init: function(enableMouse) {
		var me = this;
//		for (var x=10; x<800; x+= 30) {
//			for (var y=10; y<600; y+=30) {
//				this.sites.push({x:x+irndab(-5,5),y:y+irndab(-5,5), c:0})
//			}
//		}
		//this.diagram = this.voronoi.compute(this.sites, this.bbox);
		me.ice_pattern = C.createPattern(ice_canvas, 'repeat');
		me.grass_pattern = C.createPattern(grass_canvas,'repeat');
		this.canvas = document.getElementById('voronoiCanvas');
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
		//this.randomSites(10,true);
		//this.render();
		},

	clearSites: function() {
		// we want at least one site, the one tracking the mouse
		this.sites = [{x:0,y:0}];
		this.diagram = this.voronoi.compute(this.sites, this.bbox);
		},

//	randomSites: function(n,clear) {
//		if (clear) {this.sites = [];}
//		var xo = this.margin;
//		var dx = this.canvas.width-this.margin*2;
//		var yo = this.margin;
//		var dy = this.canvas.height-this.margin*2;
//		for (var i=0; i<n; i++) {
//			this.sites.push({x:self.Math.round(xo+self.Math.random()*dx),y:self.Math.round(yo+self.Math.random()*dy)});
//			}
//		this.diagram = this.voronoi.compute(this.sites, this.bbox);
//		},

	addSite: function(x,y, c) {
		this.sites.push({x:x,y:y, c:c});
		this.diagram = this.voronoi.compute(this.sites, this.bbox);
		},

	render: function() {
		var ctx = this.canvas.getContext('2d');
		// background
		ctx.globalAlpha = 1;
		ctx.beginPath();
		ctx.rect(0,0,this.canvas.width,this.canvas.height);
		ctx.fillStyle = "#fff";
		ctx.fill();
		ctx.strokeStyle = '#888';
		ctx.stroke();
		// voronoi
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
		for (var c=0; c<3; c++) {
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
//		ctx.strokeStyle='#000';
//		// edges
//		var edges = this.diagram.edges,
//			nEdges = edges.length,
//			v;
//		if (nEdges) {
//			var edge;
//			ctx.beginPath();
//			while (nEdges--) {
//				edge = edges[nEdges];
//				v = edge.va;
//				ctx.moveTo(v.x,v.y);
//				v = edge.vb;
//				ctx.lineTo(v.x,v.y);
//				}
//			ctx.stroke();
//			}
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