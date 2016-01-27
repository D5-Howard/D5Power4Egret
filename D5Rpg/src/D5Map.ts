//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2014-2015, MicroGame Technology Inc.
//  All rights reserved.
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the Egret nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY EGRET AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
//  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL EGRET AND CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
//  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;LOSS OF USE, DATA,
//  OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
//  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
//  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//////////////////////////////////////////////////////////////////////////////////////
module d5power {
    /**
     * 2.5D透视地图
     */
    export class D5Map implements d5power.IMap {

        /**
         * 在二进制文件中，由于需要1个字节表示多个状态。因此采用大于0的值表示可通过
         * 在导入后进行了转义
         */
        private static BIN_ALPHA_VALUE:number = 2;
        private static BIN_CAN_VALUE:number = 1;
        private static BIN_NO_VALUE:number = 0;
        private static _tilePool:Array<egret.Bitmap>=new Array<egret.Bitmap>();
        private static rebuildPool(num:number):void
        {
            if(D5Map._tilePool.length>num)
            {
                while(D5Map._tilePool.length>num) D5Map._tilePool.pop();
            }else{
                while(D5Map._tilePool.length<num) D5Map._tilePool.push(new egret.Bitmap());
            }

            //console.log("[D5Map] there are ",num,"tiles in pool.");
        }

        private static back2pool(data:egret.Bitmap):void
        {
            if(D5Map._tilePool.indexOf(data)==-1) D5Map._tilePool.push(data);
            //console.log("[D5Map] 1 tiles get home.there are ",D5Map._tilePool.length,"tiles in pool.");
        }

        private static getTile():egret.Bitmap
        {
            var data:egret.Bitmap;
            data = D5Map._tilePool.length ? D5Map._tilePool.pop() : new egret.Bitmap();
            //console.log("[D5Map] pop 1 tiles.there are ",D5Map._tilePool.length,"tiles in pool.");
            data.texture=null;
            return data;
        }

        private _mapid:number;
        private _mapWidth:number;
        private _mapHeight:number;
        private _tileW:number;
        private _tileH:number;
        private _onReady:Function;
        private _onReadyThis:any;
        private _mapResource:any;
        private _tileFormat:string='.jpg';
        private _tempPoint:egret.Point;

        private _roadW:number = 60;
        private _roadH:number = 30;


        private _smallMap:egret.SpriteSheet;
        private _roadArr:Array<any>;
        private _alphaArr:Array<any>;

        /**
         * 显示区域区块数量
         */
        private _areaX:number;
        private _areaY:number;

        private _nowStartX:number=-1;
        private _nowStartY:number=-1;
        /**
         * 当前屏幕正在渲染的坐标记录
         */
        private _posFlush:Array<any>;

        /**
         * 正常渲染层（与角色同层次）
         */
        private _dbuffer:egret.DisplayObjectContainer;

        private _astar:SilzAstar;

        public constructor(id:number) {
            this._mapid = id;
        }

        public get id():number {
            return this._mapid;
        }

        public setContainer(container:egret.DisplayObjectContainer):void
        {
            if(container==this._dbuffer) return;
            if(this._dbuffer!=null)
            {
                this._dbuffer.removeChildren();
                if(this._dbuffer.parent) this._dbuffer.parent.removeChild(this._dbuffer);
            }
            this._dbuffer = container;
        }

        public setTileFormat(s:string):void
        {
            if(s.substr(0,1)!='.') s = "."+s;
            this._tileFormat = s;
        }

        public setup(id:number, w:number, h:number, tw:number, th:number, onReady:Function, onReadyThis:any):void {
            this._mapid = id;
            this._mapHeight = h;
            this._mapWidth = w;
            this._tileW = tw;
            this._tileH = th;
            this._onReady = onReady;
            this._onReadyThis = onReadyThis;

            this._nowStartX = -1;
            this._nowStartY = -1;
            var onSmallMapLoaded:Function = function (data:egret.Texture):void {
                this._smallMap = data;
                this._smallMap = new egret.SpriteSheet(data);
                this.createSmallData(data.textureWidth,data.textureHeight);
                RES.getResByUrl(D5Game.RES_SERVER + D5Game.ASSET_PATH + '/tiles/' + this._mapid + '/roadmap.bin',this.setupRoad,this,RES.ResourceItem.TYPE_BIN);
            };

            RES.getResByUrl(D5Game.RES_SERVER + D5Game.ASSET_PATH + '/tiles/' + this._mapid + '/s.jpg', onSmallMapLoaded, this);
        }
        private createSmallData(smallW:number,smallH:number):void
        {
            var smallWidth:number = smallW/(this._mapWidth/this._tileW);
            var smallHeight:number = smallH/(this._mapHeight/this._tileH);
            var i:number;
            var l:number;
            for(l=0;l<this._mapWidth/this._tileW;l++)
            {
                for(i=0;i<this._mapHeight/this._tileH;i++)
                {
                    this._smallMap.createTexture('small' + l + '_' + i, i * smallWidth, l * smallHeight, smallWidth, smallHeight,0,0);
                }
            }
        }
        public get width():number {
            return this._mapWidth;
        }

        public get height():number {
            return this._mapHeight;
        }

        public get tileWidth():number {
            return this._tileW;
        }

        public get tileHeight():number {
            return this._tileH;
        }

        public get roadWidth():number
        {
            return this._roadW;
        }

        public get roadHeight():number
        {
            return this._roadH;
        }

        public runPos(dataList:Array<IGD>):void
        {
            for (var i:number = dataList.length - 1; i >= 0; i--) 
            {
                dataList[i].deleting ?  D5Game.me.removeObject(i):dataList[i].run();
            }
        }

        public render(flush:boolean = false):void {

            if(this.mod_buffer)
            {
                this.mod_buffer=false;
                this._dbuffer.cacheAsBitmap=true;
            }

            var startx:number = parseInt(<string><any>(D5Game.me.camera.zeroX / this._tileW));
            var starty:number = parseInt(<string><any>(D5Game.me.camera.zeroY / this._tileH));
            this.makeData(startx, starty, flush); // 只有在采用大地图背景的前提下才不断修正数据
            this.makeTiledData(); //不断更新tiled地图数据  
            this.makeFarData(); //不断更新远景地图
            if (this._nowStartX == startx && this._nowStartY == starty && this._posFlush != null) {
                var zero_x:number = D5Game.me.camera.zeroX % this._tileW;
                var zero_y:number = D5Game.me.camera.zeroY % this._tileH;
                this._dbuffer.x = -zero_x;
                this._dbuffer.y = -zero_y;
            }
        }

        public resize():void
        {
            this._areaX = Math.ceil(D5Game.me.screenWidth / this._tileW) + 1;
            this._areaY = Math.ceil(D5Game.me.screenHeight / this._tileH) + 1;
            console.log("[D5Game] max tiles number ",this._areaX,this._areaY);
            D5Map.rebuildPool(this._areaX*this._areaY+this._areaX+this._areaY);
        }

        /**
         * 重置地图数据
         */
        public resetRoad():void {
            this._roadArr = [];
            this._alphaArr = [];
            // 定义临时地图数据
            var h:number = Math.floor(this._mapHeight / this._roadH);
            var w:number = Math.floor(this._mapWidth / this._roadW);
            for (var y:number = 0; y < h; y++) {
                var arr:Array<number> = new Array<number>();
                var arr2:Array<number> = new Array<number>();
                for (var x:number = 0; x < w; x++) {
                    arr.push(0);
                    arr2.push(0);
                }
                this._roadArr.push(arr);
                this._alphaArr.push(arr2);
            }
        }

        /**
         * 设置地图数据
         * @param data
         */
        public setRoad(data:Array<Array<number>>):void
        {
            this._roadArr = data;
        }

        public isInAlphaArea(px:number,py:number):boolean
        {
            var tile: egret.Point = this.Postion2Tile(px,py);
            return this._alphaArr[tile.y] && this._alphaArr[tile.y][tile.x]==D5Map.BIN_ALPHA_VALUE;
        }
        
        /**
         * 尝试寻找周围可以通过的位置
         * 进行若干次尝试，如果没有发现，则返回null，请注意容错判断
         */
        public getPointAround(center:egret.Point,from:egret.Point,r:number):egret.Point
        {
            if(!center || !from) return null;
            var i:number = 0;
            var max:number = 5;
            var step:number = Math.PI*2/max;
            var gotoP:egret.Point = new egret.Point();
            var angle:number = GMath.getPointAngle(center.x-from.x,center.y-from.y)+(Math.random()>.5 ? 1 : -1)*Math.PI/8;
            while(i<max)
            {
                var n:number = step*i+angle;
                gotoP.x = Math.round(center.x-r*Math.cos(n));
                gotoP.y = Math.round(center.y-r*Math.sin(n));
                if(this.PointCanMove(gotoP,from))
                {
                    return gotoP;
                    break;
                }
                i++;
            }

            return null;
        }

        public PointCanMove(p:egret.Point,n:egret.Point):Boolean
        {
            if(this._astar==null) return true;
            var nodeArr:Array<any> = this._astar.find(n.x,n.y,p.x,p.y);
            return nodeArr!=null;
        }


        public getRoadPass(px:number,py:number):boolean
        {
            if(this._roadArr[py]==null || this._roadArr[py][px]!=0) return false;
            return true;
        }

        public find(xnow:number,ynow:number,xpos:number,ypos:number):Array<any>
        {
            return this._astar==null ? null : this._astar.find(xnow,ynow,xpos,ypos);
        }



        /**
         * 根据屏幕某点坐标获取其在世界（全地图）内的坐标
         */
        public getWorldPostion(x:number, y:number):egret.Point {
            this._tempPoint.x = D5Game.me.camera.zeroX + x;
            this._tempPoint.y = D5Game.me.camera.zeroY + y;

            return this._tempPoint;
        }

        /**
         * 根据世界坐标获取在屏幕内的坐标
         */
        public getScreenPostion(x:number, y:number):egret.Point {
            this._tempPoint.x = x - D5Game.me.camera.zeroX;
            this._tempPoint.y = y - D5Game.me.camera.zeroY;
            return this._tempPoint;
        }

        /**
         * 根据路点获得世界（全地图）内的坐标
         */
        public tile2WorldPostion(x:number, y:number):egret.Point {
            this._tempPoint.x = x * this._roadW + this._roadW * .5;
            this._tempPoint.y = y * this._roadH + this._roadH * .5;
            return this._tempPoint;
        }

        /**
         * 世界地图到路点的转换
         */
        public Postion2Tile(px:number, py:number):egret.Point {
            if(this._tempPoint==null)this._tempPoint = new egret.Point();
            this._tempPoint.x = Math.floor(px / this._roadW);
            this._tempPoint.y = Math.floor(py / this._roadH);
            return this._tempPoint;
        }

        public reset():void
        {
            this._tempPoint = new egret.Point();
            this._mapResource = {tiles: new Object()};
            this._dbuffer.removeChildren();
            
//            this._tiledResource = {};
        }

        /**
         * 设置路点。至此，地图准备完毕，通知主程序开始渲染
         * @param data
         */
        private setupRoad(res:ArrayBuffer):void {

            if(res==null || res==undefined)
            {
                this.resetRoad();
            }else {
                var data:egret.ByteArray = new egret.ByteArray();
                //data.setArrayBuffer(res);
                data['_setArrayBuffer'](res);

                var sign:string = data.readUTFBytes(5);
                var value:number;
                
                var px: number = 0;
                var py: number = 0;
                
                if (sign == 'D5Map') {
                    py = data.readShort();
                    px = data.readShort();

                    var resmap:Array<any> = [];
                    for (var y:number = 0; y < py; y++) {
                        var temp:Array<number> = [];
                        for (var x:number = 0; x < px; x++) {
                            temp.push(data.readByte());
                        }
                        resmap.push(temp);
                    }


                    this.resetRoad();
                    
                    if(px > 1) {
                        var h: number = Math.floor(this._mapHeight / this._roadH);
                        var w: number = Math.floor(this._mapWidth / this._roadW);

                        var k: number = w == px && h == py ? 1 : py/h;

                        for(y = 0;y < h;y++) {
                            for(x = 0;x < w;x++) {
                                try {
                                    py = Math.floor(y * k);
                                    px = Math.floor(x * k);
                                    value = resmap[py][px];
                                    this._roadArr[y][x] = value == D5Map.BIN_NO_VALUE ? 1 : 0;
                                    this._alphaArr[y][x] = value;
                                } catch(e) {
                                    trace("［D5Map］路点超出范围Y:X(" + y + ":" + x + ")",py,px);
                                    this._roadArr[y][x] = D5Map.BIN_NO_VALUE;
                                    this._alphaArr[y][x] = D5Map.BIN_NO_VALUE;
                                }
                            }
                        }
                    }
                } else {
                    console.log("[D5Map]非法的地图配置文件");
                }
            }

            this.reset();
            this.resize();

            this._astar = new SilzAstar(this._roadArr);

            if (this._onReady != null) {
                this._onReady.apply(this._onReadyThis);
            }


        }

        private makeData(startx:number, starty:number, flush:boolean):void
        {
            if (this._nowStartX == startx && this._nowStartY == starty) return;

            this._nowStartX = startx;
            this._nowStartY = starty;

            this._posFlush=[];
            for(var i:number=0,j:number=this._dbuffer.numChildren;i<j;i++)
            {
                (<egret.Bitmap><any>this._dbuffer.getChildAt(i)).texture=null;
            }
            //this.fillSmallMap(startx, starty);

            var maxY:number = Math.min(starty + this._areaY, Math.floor(this._mapHeight / this._tileH));
            var maxX:number = Math.min(startx + this._areaX, Math.floor(this._mapWidth / this._tileW));

            var key:string;
            for (var y:number = starty; y < maxY; y++) {
                for (var x:number = startx; x < maxX; x++) {
                    key = y + '_' + x;
                    if (x < 0 || y < 0) {
                        continue;
                    } else if(this._mapResource.tiles[key]==null){
                        this._posFlush.push(y + '_' + x + '_' +this._nowStartX + '_' +this._nowStartY + '_' +this._mapid);
                        this.fillSmallMap(y, x,(x-this._nowStartX),(y-this._nowStartY));
                    }else{
                        this.fillTile((x-this._nowStartX),(y-this._nowStartY),this._mapResource.tiles[key]);
                    }
                }
            }

            this.loadTiles();
        }

        public clear():void
        {
            this._mapResource = {tiles: new Object()};
            var loop:egret.Bitmap;
            while(this._dbuffer.numChildren)
            {
                loop = <egret.Bitmap><any>this._dbuffer.removeChildAt(0);
                loop.texture=null;
                D5Map.back2pool(loop);
            }

            if(this._tiledBuff)
            {
                while(this._tiledBuff.numChildren)
                {
                    loop = <egret.Bitmap><any>this._tiledBuff.removeChildAt(0);
                    loop.texture=null;
                    D5Map.back2pool(loop);
                }
            }
       
            this.tmx = null;
            this._isReady = false;
            this._tiledLayerData = null;
            this._tiledResource = null;
            this._nowName = '';
        }

        private _nowName='';
        private loadTiles(data:egret.Texture=null):void
        {
            if(data!=null)
            {
                var pos:Array<any> = this._nowName.split('_');
                if(parseInt(pos[4])!=this._mapid)
                {
                    console.log("[D5Map] 读取了已切换了的地图资源");
                    return;
                }
                var tileName:string = pos[0]+"_"+pos[1];
                if(this._mapResource.tiles[tileName]==null) this._mapResource.tiles[tileName] = data;

                // 若加载后位置已变更，则只存储不渲染
                var tx:number = parseInt(pos[1]) - this._nowStartX;
                var ty:number = parseInt(pos[0]) - this._nowStartY;
                if(parseInt(pos[2])==this._nowStartX && parseInt(pos[3])==this._nowStartY) {
                    this.fillTile(tx,ty,data);
                }

                this._nowName='';
            }

            if (this._posFlush.length == 0) {
                this._dbuffer.cacheAsBitmap=false;
                this.mod_buffer=true;
            } else if (this._nowName == '') {
                this._nowName = this._posFlush.pop();
                var pos:Array<any> = this._nowName.split('_');
                var name:string = D5Game.RES_SERVER + D5Game.ASSET_PATH + "/tiles/" + this._mapid + "/" + pos[0] + "_" + pos[1] + this._tileFormat;
                RES.getResByUrl(name, this.loadTiles, this);
            }
        }

        private mod_buffer:boolean;
        private fillTile(tx:number,ty:number,data:egret.Texture):void
        {
            var bitmap: egret.Bitmap = <egret.Bitmap><any>this._dbuffer.getChildByName(tx + "_" + ty);
            if(bitmap==null)
            {
                bitmap = D5Map.getTile();
                bitmap.x = tx * this._tileW;
                bitmap.y = ty * this._tileH;
                bitmap.name = tx+"_"+ty;
                this._dbuffer.addChild(bitmap);
            }
            bitmap.texture = data;

            this._dbuffer.cacheAsBitmap=true;
        }

        /**
         * 绘制小地图
         */
        private fillSmallMap(startX:number,startY:number,tx:number,ty:number):void
        {
            var data:egret.Texture = this._smallMap.getTexture('small'+startX+'_'+startY);
            var bitmap: egret.Bitmap = <egret.Bitmap><any>this._dbuffer.getChildByName(tx + "_" + ty);
            if(bitmap==null)
            {
                bitmap = D5Map.getTile();
                bitmap.x = tx * this._tileW;
                bitmap.y = ty * this._tileH;
                bitmap.fillMode = egret.BitmapFillMode.SCALE;
                bitmap.name = tx+"_"+ty;
                this._dbuffer.addChild(bitmap);
            }
            bitmap.texture = data;
            bitmap.width = this._tileW;
            bitmap.height = this._tileH;
            this._dbuffer.cacheAsBitmap=true;
        }
        
        /**
         * 加载 tiled配置文件
         */ 
        public setupTiled(name: string,type:number,data:Array<any>,container:egret.DisplayObjectContainer):void
        {
            this._tiledResource = {};
            this._tiledType = type;
            this._tiledLayerData = data;
            this._tiledBuff = container;
            this._tiledName = name;
            RES.getResByUrl(D5Game.RES_SERVER + D5Game.ASSET_PATH + '/tiles/' + this._mapid +'/'+ name, this.onTiledLoaded, this);
        }
        
        private  tmx:TiledMap; //tiled地图配置文件
        private _tiledName: string;
        private _tiledBuff:egret.DisplayObjectContainer; //tiled 容器
        private _tiledType: number;//tiled 填充类型 0 无 1 横向 2纵向 3四方
        private _tiledLayerData: Array<any>;//tiled 图层地图数据
        private _tiledResource: any; //tiled 地图 图片池
        private tileset: TiledTileSet;  //tiled 素材图配置相关
        private _nowTiledStartX: number = -1; //tiled当前显示 块X
        private _nowTiledStartY: number = -1;//tiled当前显示 块Y
        private _tiledRows:number = 1; //横向数量
        private _tiledCols:number = 1; //纵向数量
        /**
        * 显示区域区块数量
        */
        private _tiledareaX:number;
        private _tiledareaY:number;
        private _isReady: boolean = false;
        private _tiledLoad: Array<any>;
        
        private _tiledLoadNum: number = 0;
        private _nowTiledSet: TiledTileSet;
        
        private  onTiledLoaded(data:any):void 
        {
            if(data)
            {
                this.tmx = new TiledMap();
                this.tmx.format(data);    
                this._nowTiledSet = <TiledTileSet><any>this.tmx.imgLib[this._tiledLoadNum];
                var url: string = D5Game.RES_SERVER + D5Game.ASSET_PATH + '/tiles/' + this._mapid + '/' + this._nowTiledSet.imageSource;
                RES.getResByUrl(url,this.loadTiled,this);
             }
         }
         
        /**
         * 解析tiled 地图 元素
         */ 
        private loadTiled(data:egret.Texture=null):void
        {
            this._tiledLoadNum++;
            TiledResourceData.setupResLib(this._tiledName,data,this._nowTiledSet);
            
            if(this._tiledLoadNum < this.tmx.imgLib.length)
            {
                this._nowTiledSet = <TiledTileSet><any>this.tmx.imgLib[this._tiledLoadNum];
                var url: string = D5Game.RES_SERVER + D5Game.ASSET_PATH + '/tiles/' + this._mapid + '/' + this._nowTiledSet.imageSource;
                RES.getResByUrl(url,this.loadTiled,this);
                return;
            }else
            {
                    
                var mapTiles:Array<any>;
                var mapTilesX:number, mapTilesY:number;
                                    
                for(var layer_num: number = 0;layer_num < this._tiledLayerData.length;++layer_num) {
                          var layer: any = this._tiledLayerData[layer_num];
                          if(layer.data == null) break;
                                        mapTiles = Base64.decodeToArray(layer.data,layer.width,false);
                                        mapTilesX = mapTiles.length;
                                        for(var i: number = 0;i < mapTilesX;++i) {
                                            mapTilesY = mapTiles[i].length;
                                            for(var j: number = 0;j < mapTilesY;++j) {
                                                if(mapTiles[i][j] != 0) {
                                                    var bit: egret.Bitmap = new egret.Bitmap;
                                                    var txture: egret.Texture = new egret.Texture;
                                                    txture = TiledResourceData.getResource(this._tiledName,mapTiles[i][j]);
                                                    bit.texture = txture;
                                                    this._tiledResource[layer_num + "_" + i + "_" + j] = txture;
                                                }
                                            }
                                        }
                                    }
                this._isReady = true;
                this._tiledLoadNum = 0;
            }           
        }  
        /**
         * 重置 刷新 tiled地图
         */ 
        private makeTiledData():void
        {
            if(!this.tmx) return;
            if(!this._isReady) return;
            this._tiledareaX = Math.floor(D5Game.me.screenWidth / this.tmx.tileWidth) + 1;
            this._tiledareaY = Math.floor(D5Game.me.screenHeight / this.tmx.tileHeight) + 1;
            var startx:number = Math.floor(D5Game.me.camera.zeroX / this.tmx.tileWidth);
            var starty:number = Math.floor(D5Game.me.camera.zeroY / this.tmx.tileHeight);
            var zero_x:number = D5Game.me.camera.zeroX % this.tmx.tileWidth;
            var zero_y:number = D5Game.me.camera.zeroY % this.tmx.tileHeight;
            this._tiledBuff.x = -zero_x;
            this._tiledBuff.y = -zero_y;
            if(this._nowTiledStartX == startx && this._nowTiledStartY == starty) return;
            this._nowTiledStartX = startx;
            this._nowTiledStartY = starty;
            this._tiledRows = this.tmx.width;
            this._tiledCols = this.tmx.height;
            
            var mapTiles:Array<any>;
            var mapTilesX:number, mapTilesY:number;
            var i: number,j:number;
            for(i = 0,j=this._tiledBuff.numChildren;i<j;i++)
            {
                (<egret.Bitmap><any>this._tiledBuff.getChildAt(i)).texture=null;
            }
            var maxX: number = Math.ceil(D5Game.me.stage.stageWidth  / this.tmx.tileWidth)+startx+1;
            var maxY: number = Math.ceil(D5Game.me.stage.stageHeight  / this.tmx.tileHeight)+starty+1;
            var key:string;
            for(i = 0,j = this.tmx.layers_ordered.length;i < j;i++) {
                for(var m: number = starty;m < maxY;m++) {
                    for(var n: number = startx;n < maxX;n++) {
//                        key = i + "_" + m + "_" + n;
                        key = this.fillTiledMap(i,m,n);
                        var bit: egret.Bitmap = new egret.Bitmap();
                        var texture: egret.Texture = <egret.Texture><any>this._tiledResource[key];
                        var temp: egret.Bitmap =<egret.Bitmap><any>this._tiledBuff.getChildByName(key); 
                        if(bit) 
                        {
                            if(temp)
                            {
                                temp.texture = texture;
                                temp.x = (n-startx) * this.tmx.tileWidth;
                                temp.y = (m-starty) * this.tmx.tileHeight; 
                            }else
                            {
                                this._tiledBuff.addChild(bit);
                                bit.name = key;
                                bit.texture = texture;
                                bit.x = (n-startx) * this.tmx.tileWidth;
                                bit.y = (m-starty) * this.tmx.tileHeight;
                            }

                        }else
                        {
                            if(temp) temp.texture = null;
                        }
                    }
                }
            }
            this._tiledBuff.cacheAsBitmap = true;
        }
        /**
         * tiled 填充tiled地图
         */ 
        private fillTiledMap(tx:number,ty:number,tz:number):string
        {
            var result: string = "";
            result += tx;
            switch(this._tiledType)
            {
      
                case 2:
                    result += "_" + ty % this._tiledCols + "_" + tz;
                    break;
                case 1:
                    result += "_" + ty+ "_" + tz%this._tiledRows;
                    break;
                case 3:
                    result += "_" + ty%this._tiledCols + "_" + tz%this._tiledRows;
                    break;
                case 0:
                default:
                    result += "_" + ty + "_" + tz;
                    break;
            }
            return result;
        }
        
        
        private _farName: string; //远景图片名
        private _farType: number; //远景填充方式
        private _farBuff: egret.DisplayObjectContainer; //远景容器
        private _farDisplayer: egret.Bitmap;
        private _far_x: number;//远景图 偏移x
        private _far_y: number;//远景图 偏移y
        public setupFar(name:string,type:number,container:egret.DisplayObjectContainer,far_x:number,far_y:number):void
        {
            this._farName = name;
            this._farType = type;
            this._farBuff = container;
            this._far_x = far_x;
            this._far_y = far_y;
            RES.getResByUrl(D5Game.RES_SERVER + D5Game.ASSET_PATH + '/tiles/' + this._mapid +'/'+ name, this.onFarLoaded, this);
        }
        
        private onFarLoaded(data:egret.Texture):void
        {
            if(data)
            {
                if(!this._farDisplayer) 
                {
                    this._farDisplayer = new egret.Bitmap();
                    this._farBuff.addChild(this._farDisplayer);
                }
                this._farDisplayer.texture = data;
                var f_w: number;
                var f_h: number;
                switch(this._farType)
                {
                    case 1:
                        this._farDisplayer.fillMode = egret.BitmapFillMode.REPEAT; 
                        f_w = this._mapWidth;
                        f_h = data.textureHeight;
                        break;
                    case 2:
                        this._farDisplayer.fillMode = egret.BitmapFillMode.REPEAT; 
                        f_w = data.textureWidth;
                        f_h = this._mapHeight;
                        break;
                    case 3:
                        this._farDisplayer.fillMode = egret.BitmapFillMode.REPEAT;
                        f_w = this._mapWidth;
                        f_h = this._mapHeight;
                        break;
                    case 0:
                    default:
                        this._farDisplayer.fillMode = egret.BitmapFillMode.SCALE; 
                        f_w = data.textureWidth;
                        f_h = data.textureHeight;
                        break;
                }
                this._farDisplayer.width = f_w;
                this._farDisplayer.height = f_h;
                this._farDisplayer.x = this._far_x;
                this._farDisplayer.y = this._far_y;
                
                this._farBuff.cacheAsBitmap = true;
            }
        }
        
        /**
        * 重置 刷新 tiled地图
        */ 
        private makeFarData():void
        {
            if(this._farBuff)
            {
                this._farBuff.x = -D5Game.me.camera.zeroX;
                this._farBuff.y = -D5Game.me.camera.zeroY;   
            }
        }
        /**
        * 设置重力感应
        * @param  b   boolean 
        */ 
        private _deviceorientation: boolean = false;
        public  setDeviceorientation(b:boolean):void
        {
            this._deviceorientation = b;  
            b ? window.addEventListener("deviceorientation",this.ondeviceorientation):window.removeEventListener("deviceorientation",this.ondeviceorientation);
        }
        
        public get Deviceorientation():boolean
        {
            return this._deviceorientation;
        }
        
        private ondeviceorientation(e:Event):void
        {
//            console.log(Math.floor(e.beta), Math.floor(e.gamma), Math.floor(e.alpha));
        }
        
    }
}
