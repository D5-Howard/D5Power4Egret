module d5power {
	/**
	 *
	 * @author 
	 *
	 */
	export class LvData {
        
        public  lv:number;
        public  need_exp:number;
        public  script:string;
        public  rewardList:Array<d5power.MissionBlock>;
        
		public constructor() {
            this.rewardList = new Array<d5power.MissionBlock>();
		}
        /**
         * 格式化对象
         */
        public formatObject(data:any):void
        {
            this.lv = parseInt(data.lv);
            this.need_exp = parseInt(data.exp);
        }
        
        public  addReward(type:number,value:string,num:string):void
        {
            var data:d5power.MissionBlock = new d5power.MissionBlock();
            data.format(type,value,num);
            this.rewardList.push(data);
        }
	}
}
