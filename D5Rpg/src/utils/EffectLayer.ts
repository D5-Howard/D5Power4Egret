module d5power
{
	export class EffectLayer
	{
		private _impl:EffectImplement;
		private _lastAutoMake:number;
        private _changeSetFream:number;
        private _hasReset:boolean;
        private _maker:EffectMakcer;
        
        private _dir:number;
        private _posx:number;
        private _posy:number;
        
		public constructor(impl:EffectImplement,maker:EffectMakcer)
		{
			this._impl = impl;
            this._maker = maker;
		}
        
        private addEffect(t:number):EffectObject
        {
            var obj:EffectObject;
            obj = EffectObject.getInstance();
            
            if(this._maker.owner==null)
            {
                this._dir = 0;
                this._posx = this._maker.posx;
                this._posy = this._maker.posy;
            }else{
                this._dir = this._maker.owner.direction;
                this._posx = this._maker.owner.posX;
                this._posy = this._maker.owner.posY;
            }
            
			obj.setup(t,this._impl,this._dir,this._posx,this._posy);
			obj.owner = this._maker.owner;
			obj.target = this._maker.target;
			obj.skillid = this._maker.skillid;
			
			D5Game.me.addEffect(obj);
            return obj;
        }
        
        public render(f:number,t:number):void
        {
			var i:number;
			var autoMakeTime:number = this._impl.autoMakeTime;
			
			if(autoMakeTime>0 && t-this._lastAutoMake>autoMakeTime)
			{
				var autoMakeNum:number = this._impl.autoMakeNum;
				for(i=0;i<autoMakeNum;i++) this.addEffect(t);
			}else if(f==this._impl.startFrame && !this._hasReset){
				this._changeSetFream = f;
				this._hasReset = true;

				if(this._impl.sonAngleAdd)
				{
					var num:number = this._impl.sonAngleAddNum==0 ? 360/this._impl.sonAngleAdd : this._impl.sonAngleAddNum;
					var angle:number = GMath.K_A2R*this._impl.sonAngleAdd;
					
					for(i = 0;i<num;i++)
					{
						this.addEffect(t).updateRayCopy(i,angle);
					}
				}else{
					this.addEffect(t);
				}
				
			}else if(f!=this._changeSetFream){
				this._hasReset = false;
			}
        }
	}
}