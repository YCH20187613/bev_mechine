let connectbutton = document.getElementById('connect');
let logterminal = document.getElementById('terminal');
let disconnectbutton = document.getElementById('disconnect');


connectbutton.addEventListener('click', function(){
	connect();
});

disconnectbutton.addEventListener('click', function(){
	disconnect();
});

function pour_drink_1() {
  send("s1"); 
}

function pour_drink_2() {
  send("s2"); 
}

function pour_drink_3(){ 
  send("s3");
}

function sendMixCommand(){
	let d1per = parseInt(document.getElementById('d1per').value, 10);
	let d2per = parseInt(document.getElementById('d2per').value, 10);
	let d3per = parseInt(document.getElementById('d3per').value, 10);
	if ((d1per + d2per + d3per) > 4){
		alert('Please choose maximum of 4 times!');
	}else{
		send("a"+ d1per.value + "b" + d2per.value + "c" + d3per.value);
	}
}


let dcache = null;
let ccache = null;
let rBuffer = '';

function connect() {
	return (dcache ? Promise.resolve(dcache):
		ReqBluthDevice()).
		then(device => cDCC(device)).
		then(characteristic => startNotifications(characteristic)).
		catch(error => log(error));
}

function ReqBluthDevice() {
	
	
	
	return navigator.bluetooth.requestDevice({
		filters: [{services: [0xFFE0]}],
	}).
	
		then(device => {
			
			dcache = device;
		
			dcache.addEventListener('gattserverdisconnected', handleDisconnection);
		
			return dcache;
	});
}

function handleDisconnection(event){
	let device = event.target;
	
	cDCC(device).
		then(characteristic => startNotifications(characteristic)).
		catch(error => log(error));
}

function cDCC(device) {
	if (device.gatt.connected && ccache){
		return Promise.resolve(ccache);
	}
	
	
	
	return device.gatt.connect().
		then(server => {
			
			return server.getPrimaryService(0xFFE0);
		}).
		
		then(service => {
			
			return service.getCharacteristic(0xFFE1);
		}).
		
		then(characteristic => {
			
			ccache = characteristic;
			
			return ccache;
		});
}

function startNotifications(characteristic){
	return characteristic.startNotifications().
		then(() => {
			log('Bluetooth Connected!');
			characteristic.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);
		});
}



function log(data, type = ''){
	logterminal.insertAdjacentHTML('beforeend', '<div>' + data + '</div>');
}
if (ccache){
	ccache.removeEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);
	ccache = null;
}


function handleCharacteristicValueChanged(event){
	let value = new TextDecoder().decode(event.target.value);
	
	for (let c of value){
		if(c === '\n'){
			let data = rBuffer.trim();
			rBuffer = '';
			
			if(data){
				receive(data);
			}
		}else{
			rBuffer += c;
		}
	}
}

function recieve(data){
	log("recieved:"+data);
}


function send(data){
	data = String(data);
	
	if(!data || !ccache){
		return;
	}
	
	log('choosed' + data);
	writeToCharacteristic(ccache, data);
	
}

function writeToCharacteristic(characteristic, data){
	characteristic.writeValue(new TextEncoder().encode(data));
}

function disconnect(){
	if(dcache){
		log('Disconnnecting from"' + dcache.name + '" bluetooth device');
		dcache.removeEventListener('gattserverdisconnected', handleDisconnection);
		
		if(dcache.gatt.connected){
			dcache.gatt.disconnect();
			log('bluetooth device disconnect');
		} else {
		log('bluetooth device alr disconnected');
	}
	
	if(ccache){
		ccache.removeEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);
		ccache = null;
	}
	dcache = null;
	}
}
