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
module d5power
{
    export class EffectObject extends egret.DisplayObjectContainer implements ISpriteSheetWaiter
    {
        public static MAX_POOL_NUM:number = 100;
        private static _pool_event:Array<EffectObject>=[];
        
        public owner:IGD;
        public target:IGD;
        public skillid:number;

        public static getInstance():EffectObject
        {
            var obj:EffectObject;
            if(EffectObject._pool_event.length)
            {
                obj = EffectObject._pool_event.pop();
            }else{
                obj = new EffectObject();
                obj._monitor = new egret.Bitmap();
            }
            return obj;
        }

        private static back2pool(obj:EffectObject):void
        {
            if(EffectObject._pool_event.length<EffectObject.MAX_POOL_NUM && EffectObject._pool_event.indexOf(obj)==-1) EffectObject._pool_event.push(obj);
        }

        public constructor(){
            super();
        }
        public get loadID():number
        {
            return this._loadID;
        }
        
        public updateRayCopy(deep:number,angle:number):void
		{
			this._moveAngle+=angle*deep;
			this._sonAngle+=angle*deep;
		}
        
        private _lastRender:number;
        private _impl:EffectImplement;
        private _playFrame:number=0;
        private _totalframe:number;
        public _spriteSheet:IDisplayer;
        protected _monitor:egret.Bitmap;
        private _loadID:number=0;
        private _sheet:egret.SpriteSheet;
        private _res:string;
        protected _drawAction:Function;
        private _liveStart:number = 0;
        private _moveAngle:number;
        private _sonAngle:number;
        private _posx:number;
        private _posy:number;
        private _dir:number;
        private _sonDeep:number;
        public deleting:boolean=false;
        private _offX:number;
        private _offY:number;
        
        public setup(start:number,data:EffectImplement,dir:number,posx:number,posy:number):void
        {
            this._impl = data;
            this._moveAngle = data.getMoveAngle(dir);
            this._sonAngle = data.getSonAngle(dir);
            this._dir = dir;
            this._posx = posx;
            this._posy = posy;
            this._liveStart = start;
            this._sonDeep = data.sonFrameDeep;
            this._monitor.alpha = 1;
            this._monitor.rotation = 0;
            this._monitor.scaleX = this._monitor.scaleY = 1;
            this.deleting = false;
            var res:string = this._impl.res;
            
            var p:Array<any> = data.getDirectionPos(dir);
            this._offX = p[0];
            this._offY = p[1];
            
            this._posx+=this._offX;
            this._posy+=this._offY;
            
            if(res.indexOf('.json')!=-1)
            {
                this._res = res.substr(0,res.length-5);
                this._loadID++;
                D5SpriteSheet.getInstance(this._res+'.png',this);
            }
            else if(res.indexOf('.png')!=-1)
            {
                this._res = res;
                this.onTextureComplete(D5UIResourceData.getData(this._res).getResource(0));
            }
        }
        private onTextureComplete(data:egret.Texture):void
        {
            this._monitor.texture = data;
            this._totalframe = 5;
            this._drawAction = this.draw;
            this.runPos();
            this._impl.lowLv ? D5Game.me.bottomLayer.addChild(this._monitor) : D5Game.me.topLayer.addChild(this._monitor);
        }

        public onSpriteSheepReady(data:IDisplayer):void
        {
            if (this._spriteSheet) this._spriteSheet.unlink();
            if(data == null) return;
            this._spriteSheet = data;
            this._totalframe = this._spriteSheet.totalFrame;
            this._drawAction = this.drawJson;
            this.runPos();
            this._impl.lowLv ? D5Game.me.bottomLayer.addChild(this._monitor) : D5Game.me.topLayer.addChild(this._monitor);
        }

        private runPos():void
        {
            var target:egret.Point = D5Game.me.map.getScreenPostion(this._posx,this._posy);
            if(this._monitor)
            {
                this._monitor.x = target.x;
                this._monitor.y = target.y;
                
                if(this._spriteSheet)
                {
                    this._monitor.x+=this._spriteSheet.gX;
                    this._monitor.y+=this._spriteSheet.gY;
                }else{
                    this._monitor.x-=this._monitor.width>>1;
                    this._monitor.y-=this._monitor.height>>1;
                }
            }
            
            
        }
        
        private _lastCheck:number;
        public render():void
        {
            this._drawAction!=null ? this._drawAction() : 0;
        }
        private draw():void
        {
            var t:number = egret.getTimer();

            if(this._impl.live>0 && t-this._liveStart>this._impl.live)
            {
                this.dispose();
                return;
            }


            var cost_time:number = (t - this._liveStart) / this._impl.playSpeed;
            if (this._playFrame != cost_time)
            {
                this._playFrame = Math.floor(cost_time % this._totalframe);
                
                if(this._impl.moveSpeed!=0)
                {
                   this._posx+=Math.cos(this._moveAngle)*this._impl.moveSpeed;
                   this._posy+=Math.sin(this._moveAngle)*this._impl.moveSpeed;
                }
                
                this.runPos();
                
                if(this._impl.alphaSpeed!=0)
                {
                    this._monitor.alpha+=this._impl.alphaSpeed;
                    if(this._monitor.alpha<=0)
                    {
                        this.dispose();
                        return;
                    }
                }

                if(this._impl.zoomSpeed!=0)
                {
                    this._monitor.scaleX+=this._impl.zoomSpeed;
                    this._monitor.scaleY+=this._impl.zoomSpeed;
                }

                if(this._impl.rotationSpeed!=0)
                {
                    this.rotation+=this._impl.rotationSpeed;
                }
                
                if(this._playFrame==this._impl.sonFrame && this._sonDeep>0)
                {
                   var obj:EffectObject = this.clone(true);
                   obj._sonDeep = --this._sonDeep;
                   obj._posx = this._posx+this._impl.sonSpeed*Math.cos(this._sonAngle);
                   obj._posy = this._posy+this._impl.sonSpeed*Math.sin(this._sonAngle);
                   D5Game.me.addEffect(obj);
                }

                if(this._playFrame==this._totalframe-1 && this._totalframe>0)
                {
                    this.dispose();
                }
            }
        }
        private drawJson():void
        {
            if(egret.getTimer()-this._lastRender<this._spriteSheet.renderTime) return;
            
            this.draw();
            
            this._lastRender = egret.getTimer();
            var direction:number = 0;
            this._monitor.texture = this._spriteSheet.getTexture(direction,this._playFrame);
            if(this._spriteSheet.uvList)
            {
                var f: number = direction * this._spriteSheet.totalFrame + this._playFrame;
                this._monitor.x+= this._spriteSheet.uvList[f].offX;
                this._monitor.y+= this._spriteSheet.uvList[f].offY;
            }
            else
            {
                this._monitor.x+= this._spriteSheet.gX;
                this._monitor.y+= this._spriteSheet.gY;
            }

            this._playFrame++;
            if(this._playFrame>=this._spriteSheet.totalFrame) this._playFrame=0;
            
            
        }
        /**
         * @param	allPro	是否克隆全部属性
         */
        public clone(allPro:boolean=false):EffectObject
        {
            var p:EffectObject = EffectObject.getInstance();
            p.setup(D5Game.me.timer,this._impl,this._dir,this._posx,this._posy);
            p._moveAngle = this._moveAngle;
            p._sonAngle = this._sonAngle;
            p._posx = this._posx;
            p._posy = this._posy;
            return p;
        }

        public dispose():void
        {
            this.deleting = true;
            this.owner = null;
            this.target = null;
            this.skillid = 0;
            if(this._monitor && this._monitor.parent) this._monitor.parent.removeChild(this._monitor);
            EffectObject.back2pool(this);
        }
    }
}
