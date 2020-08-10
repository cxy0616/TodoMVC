(function (Vue) {//表示依赖了全局的 Vue
	const STORAGE_KEY='items-vuejs'
	//进行本地存储、获取数据
	const itemStorage={
		//获取数据
		fetch:function(){
			//将获取的json字符串转换成数组对象
			return JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]')
		},
		//保存数据
		save:function(items){
			// 将数组转换成JS格式进行存储(JSON格式的数组)
			localStorage.setItem(STORAGE_KEY,JSON.stringify(items));
		}
	}

	
	const items=[
		{
			id:1,//主键id
			content:'vue.js',//输入的内容
			completed:false//是否完成
		},
		{
			id:2,//主键id
			content:'java',//输入的内容
			completed:false//是否完成
		},
		{
			id:3,//主键id
			content:'python',//输入的内容
			completed:true//是否完成
		}
	];
	// 注册全局指令，directive后没有s，指令名不要加v-，但是在引用这个指令时需要加上v-
	Vue.directive('app-focus',{
      inserted(el,binding){
		  //第一次插入时调用，元素有更新时不会使用？
          el.focus();//元素自动获取焦点
  },
//   update(el,binding){
// 	// 元素有更新时使用?
// 	  //只有双击那个元素才会获取焦点
// 	  if(binding.value){
// 		  el.focus();
// 	  }
 // }
	})
	var vm=new Vue({
		el:'#todoapp',
		data:{
			//items,//这是对象属性的简写方式，等价于items:items（ES6的简写属性）
             //将新改变的items存储到localstorage之后，刷新之后页面还是没有显示，这是因为items使用的是const中的items的三条数据进行的初始化
			items:itemStorage.fetch(),
			currentItem:null,//代表的是点击的那个任务项
			filterStatus:'all'//接收变化的状态值
		},
		//定于监听器
		watch:{//监听的是items数组对象，对对象本身的增删是可以监听到的，但是当修改item中的某个属性（content）时，监听不到
			// 因为items数组内部是对象，当对象的值发生变化后要被监听到，在选项参数中使用deep: true实现深度监听
			
		// 	items:function(newValue,old){
		// 	  console.log('jianting',newValue);

		//   }
				items:{
					deep:true,
					handler:function(newItems,oldItems){
					   //将数据保存到本地
					   itemStorage.save(newItems);
					}
			  

		  }
		},
		//自定义局部指令
		directives:{
			'todo-focus':{
				update(el,binding){
					  //只有双击那个元素才会获取焦点
					  if(binding.value){
						  el.focus();
					  }
				  }
			}
		},
		methods:{
			cancelEdit(){
				this.currentItem=null;
				//当this.currentItem=null的值为空时class中的editing:item===currentItem是始终为false,所以会将editing移除
			},
			//完成编辑，保存数据
			
			finishEdit(item,index,event){
            //1.获取当前输入框的值
			const content=event.target.value.trim();
			//2.判断输入框的内容值是否为空，如果为空，则进行删除任务项
			if(!content){
				//复用下面的函数进行移除
				this.removeItem(index);
				return 
			}
			//3.如果不为空，将新输入的内容添加到原有的任务项，相当于一个更新
               item.content=content;
			//4.移除.editing样式，退出编辑样式
			//    this.currentItem=null;
			this.cancelEdit()
			//函数是vm实例的函数，所以加this
			}
			,
		
			//进入编辑状态
			toEdit(item){
				this.currentItem=item;
				//将点击的那个任务项item赋值给currentItem,用于页面.editing样式生效
				//console.log(item);
			},
			//移除所有已完成的任务项
			//具体的思路就是通过过滤将未完成的任务项，将过滤返回的未完成的任务项赋值给items，就可以间接删除已完成任务项。
			removeCompleted:function(){
              this.items=this.items.filter((item)=>{
				  //在es6的箭头函数中，只有一个参数时，小括号可以省去
				  return !item.completed;
			  })
			//   this.items=this.items.filter(item=>!item.completed);
			//在es6中当函数体只有一行代码，而且该行代码作为返回值返回，可将return和{}省去
			},
			addItem:function(event){
				//在es6中可简写为addItem(){}
				// console.log(event.target.value);
				//1.获取文本框中的内容
				const content=event.target.value.trim();
				//2.判断数据是否为空,为空什么都不做
				if(!content.length){
					return 
				}
				//3.如果不为空，将数据添加到数组中
				const id=this.items.length+1;
			    this.items.push({
						id:id,//主键id,在es6中可简写为id
						content:content,//输入的内容
						completed:false//是否完成
						//添加新数据时，completed默认是false
					})
				//4.清空文本的输入框内容
					event.target.value='';
				
			},
			//当点击删除时移除任务项
			removeItem(index){
				//console.log('delete',index);index:0,1,2
				//删除items数组中索引为index的一条数据
				this.items.splice(index,1);
			},
		},
		// 定义计算属性
		computed:{
			//根据不同状态过滤出不同的数据,filterItems计算属性根据status的不同状态存储对应的过滤出来的items
			filterItems(){//filterItems：function(){的简写表达
				// 当filterStatus的状态发生变化之后，过滤出不同的数据。
				//判断filterStatus的状态值
				switch(this.filterStatus){
					case 'active':
						// 从items中过滤出未完成的数据
						return this.items.filter(item=>!item.completed);
						break;
					case 'completed':
							// 从items中过滤出未完成的数据
						return this.items.filter(item=>item.completed);
						break;
					default:
						return this.items;
						break;

				}
			},
			toggleAll:{

				// get方法和set方法调用的时机
				//set方法：当当前计算属性的值变化时，做另外的操作。
				//get方法：当get方法使用到的属性值发生变化时，就会调用get方法
				get:function(){
				   //当任务列表中的状态发生变化之后，就更新复制框的状态
				   console.log('get',this.remaining);
				   return this.remaining===0;
				// 当监听的remaining属性的长度为0时，return true,复选框会被选中。
				},
				set:function(value){
					//value就是复选框更新之后的值
				   //当复选框的状态更新之后，则将任务列表中的状态更新
				   console.log('set');
				   //当点击复选框之后，复选框的值会发生改变，会触发set方法调用
				   //然后迭代出数组中的所有任务项，将当前复选框中状态的值赋值给每一个任务的状态值。
				this.items.forEach(function(item){//（item）=>{}
					item.completed=value;
				})
				
				
				}
			},
			//remaining是剩余未完成数量
          remaining:function(){//remaining(){}es6的简写属性
		  //通过filter函数过滤数组所有未完成的任务项
		  const unItems=this.items.filter(function(item){
			  //item是items的每一个元素
			  return !item.completed

		  //unItems用于接收过滤之后未完成的任务项，它是一个数组

		  })
		  return unItems.length;
		  }
		},
		
	})
	//写在vue实例的外面，跟vue同级，当路由哈希值发生变化之后，会自动调用该函数
	window.onhashchange=function(){
	   console.log(window.location.hash);
	//    #/  #/active #/completed
	//获取路由的哈希，当截取的哈希值不为空时返回/以后的结果，如果为空，说明点的时all,返回'all'
	   const hash=window.location.hash.substr(2)||'all';
	//    状态一旦改变，就会将hash值赋值给filterStatus,注意，此时hash变量不是在vue实例的变量范围内，通过this.filterStatus取不到该变量
	   //定义一个计算属性filterItems来感知filterStatus的变化，当它变化之后，过滤出不同的数据。
	vm.filterStatus=hash;

	}
	//第一次访问页面时，就调用一次让状态生效
	//如果不手动调用，第一次页面的hash对应的状态就不会生效，第二次才生效
	window.onhashchange();
})(Vue);
