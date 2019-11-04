from flask import Flask, render_template
from flask_socketio import SocketIO
import tensorflow as tf
import tensorlayer as tl
import numpy as np
from tensorlayer.cost import cross_entropy_seq, cross_entropy_seq_with_mask
from tqdm import tqdm
from sklearn.utils import shuffle
from data.twitter import data
from tensorlayer.models.seq2seq import Seq2seq
from tensorlayer.models.seq2seq_with_attention import Seq2seqLuongAttention
import os
from flask import request
from flask_pymongo import PyMongo
from datetime import datetime

app = Flask(__name__)
app.config['SECRET_KEY'] = 'vnkdjnfjknfl1232#'
socketio = SocketIO(app)
app.config["MONGO_URI"] = "mongodb+srv://sahaj-user:sahaj-user-password@cluster0-e171l.mongodb.net/test?retryWrites=true&w=majority&ssl=true&ssl_cert_reqs=CERT_NONE"

mongo = PyMongo(app)






@app.route('/',methods=['GET', 'POST'])
def sessions():
    return render_template('index.html')


def messageReceived(methods=['GET', 'POST']):
    print('message was received!!!')


def initialize(dataset):
    metadata, idx_q, idx_a = data.load_data(PATH='data/'+dataset+'/'.format(dataset))
    (trainingX, trainingY), (testingX, testingY), (validateX, validateY) = data.split_dataset(idx_q, idx_a)
    testingX = tl.prepro.remove_pad_sequences(testingX.tolist())
    testingY = tl.prepro.remove_pad_sequences(testingY.tolist())
    trainingX = tl.prepro.remove_pad_sequences(trainingX.tolist())
    trainingY = tl.prepro.remove_pad_sequences(trainingY.tolist())
    validateX = tl.prepro.remove_pad_sequences(validateX.tolist())
    validateY = tl.prepro.remove_pad_sequences(validateY.tolist())
    return metadata, trainingX, trainingY, testingX, testingY, validateX, validateY



@socketio.on('message')
def messageFromApp(json, methods=['GET', 'POST']):   
    print('received my event: ',str(json))
    if json['type']=="login":
        user_collection = mongo.db.users
        myDocs=user_collection.find({'$and':
                [
                    {"mobileNumber":json["mobileNumber"]},
                    {"password":json["password"]}
                ]
                }
                )
        if myDocs.count()!=0:
            response_dict={"success":1,"message":"Logged In Successfully","mobileNumber":json["mobileNumber"],"user_name":json["user_name"],"password":json["password"]}
            socketio.emit('login', response_dict,callback=messageReceived,room=request.sid)
        else:
            user_collection.insert({'user_name' : json["user_name"],'mobileNumber':json["mobileNumber"],'password':json["password"]})
            response_dict={"success":1,"message":"Signed In Successfully","mobileNumber":json["mobileNumber"],"user_name":json["user_name"],"password":json["password"]}
            socketio.emit('login', response_dict,callback=messageReceived,room=request.sid)
    elif json["type"]=="old_messages":
        message_collection = mongo.db.messages
        myDocs=message_collection.find(
                {'$and':
                    [
                        {'$or':
                            [
                                {"senderMobileNumber":json["mobileNumber"]},
                                {"receiverMobileNumber":json["mobileNumber"]}
                            ]
                        },
                        {
                            "category":json["category"]
                        }
                    ]
                }, {'_id': False}

                )
        if myDocs.count()!=0:
            socketio.emit('old_messages', list(myDocs),callback=messageReceived,room=request.sid)

    elif json['type']=="message":
        dateTimeObj = datetime.now()
        timestamp = str(dateTimeObj.year) + '-'+str(dateTimeObj.month) + '-' + str(dateTimeObj.day) + ' '+str(dateTimeObj.hour)+ ':'+str(dateTimeObj.minute)+':'+ str(dateTimeObj.second)
        message_collection = mongo.db.messages
        message_collection.insert({'user_name' : json["user_name"],'senderMobileNumber':json["mobileNumber"],'receiverMobileNumber':'chatbot','category':json["category"],'message':json["message"],'timestamp':str(dateTimeObj)})
        seed=json['message']
        if(len(seed)!=0):
            query_dict = {"user_name":json["user_name"],"message":seed}
            socketio.emit('my response', query_dict, callback=messageReceived)
            dataset = json['category']

           
            metadata, trainingX, trainingY, testingX, testingY, validateX, validateY = initialize(dataset)

          
            length_src = len(trainingX)
            tgt_len = len(trainingY)

            assert length_src == tgt_len

            batch_size = 32
            n_step = length_src // batch_size
            vocab_size_src = len(metadata['idx2w']) 
            emb_dim = 1024

            word_to_index = metadata['w2idx']   # dictionary of word 2 index
            index_to_word = metadata['idx2w']   # dictionary of index 2 word

            unk_id = word_to_index['unk']   
            pad_id = word_to_index['_']     

            start_id = vocab_size_src  
            end_id = vocab_size_src + 1  

            word_to_index.update({'start_id': start_id})
            word_to_index.update({'end_id': end_id})
            index_to_word = index_to_word + ['start_id', 'end_id']

            vocab_size_src = tgt_vocab_size = vocab_size_src + 2

            num_epochs = 50
            vocabulary_size = vocab_size_src
        
            decoder_seq_length = 20
            model_ = Seq2seq(
                decoder_seq_length = decoder_seq_length,
                cell_enc=tf.keras.layers.GRUCell,
                cell_dec=tf.keras.layers.GRUCell,
                n_layer=3,
                n_units=256,
                embedding_layer=tl.layers.Embedding(vocabulary_size=vocabulary_size, embedding_size=emb_dim),
                )
        

            

            load_weights = tl.files.load_npz(name=dataset+'_model.npz')
            tl.files.assign_weights(load_weights, model_)

            
            #for training
            #optimizer = tf.optimizers.Adam(learning_rate=0.001)
            #model_.train()

    
            # get the top result. 
            top_n_results = 1
            for i in range(top_n_results):
                model_.eval()
                user_input_id = [word_to_index.get(w, unk_id) for w in seed.split(" ")]
                sentence_id = model_(inputs=[[user_input_id]], seq_length=20, start_token=start_id, top_n_results = top_n_results)
                sentence = []
                for w_id in sentence_id[0]:
                    w = index_to_word[w_id]
                    if w == 'end_id':
                        break
                    sentence = sentence + [w]
            
                response_message=' '.join(sentence)
                if(len(response_message)!=0):
                    response_dict={"user_name":"ChatBot","message":response_message}
                else:
                    response_dict={"user_name":"ChatBot","message":"Thanks for contacting! I will get you connected with a representative. Meanwhile, is there anything else I can help you with?"}
            print(str(response_dict))
            dateTimeObjChatbot = datetime.now()
            timestampChatbot = str(dateTimeObjChatbot.year) + '-'+str(dateTimeObjChatbot.month) + '-' + str(dateTimeObjChatbot.day) + ' '+str(dateTimeObjChatbot.hour)+ ':'+str(dateTimeObjChatbot.minute)+':'+ str(dateTimeObjChatbot.second)
            message_collection.insert({'user_name' : json["user_name"],'senderMobileNumber':"chatbot",'receiverMobileNumber':json["mobileNumber"],'category':json["category"],'message':response_dict["message"],'timestamp':str(dateTimeObjChatbot)})
            socketio.emit('message', response_dict, callback=messageReceived,room=request.sid)


if __name__ == '__main__':
    socketio.run(app, debug=True,host='0.0.0.0')


